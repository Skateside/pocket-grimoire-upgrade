<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpClient\{
    HttpClient,
    NoPrivateNetworkHttpClient,
};
use League\Uri\Uri;

class Fetch
{
    /**
     * @var string $lastError The last error message that occurred.
     */
    protected string $lastError = '';

    /**
     * @var HttpClientInterface $client The HTTP interface for fetching.
     */
    private HttpClientInterface $client;

    public function __construct()
    {
        $this->client = new NoPrivateNetworkHttpClient(HttpClient::create());
    }

    /**
     * Since we have to deal with arbitrary URLs sometimes, this checks to see
     * whether or not the given URL is something that we would consider "safe".
     *
     * @param string $url URL to check.
     * @return bool|string If the URL is safe then true is returned, if the URL
     *         is not safe then a string explaining why the URL is not safe is
     *         returned.
     */
    public function isSafeUrl(string $url): bool|string
    {
        $parts = parse_url($url);

        if ($parts === false || !filter_var($url, FILTER_VALIDATE_URL)) {
            return 'error.url_not_valid';
        }

        if (($parts['scheme'] ?? '') !== 'https') {
            return 'error.url_https_only';
        }

        if (empty($parts['host'])) {
            return 'error.url_no_hostname';
        }

        if (isset($parts['user']) || isset($parts['pass'])) {
            return 'error.url_has_credentials';
        }

        if (isset($parts['port']) && $parts['port'] !== 443) {
            return 'error.url_port_not_443';
        }

        return true;
    }

    /**
     * Gets the contents of the given source and attempts to parse it as JSON,
     * returning an array with a "success" key and a "body" key.
     *
     * @param string $url URL of the contents to get and parse.
     * @return ?array<mixed> Either the parsed array or null if an error
     *         occurred.
     */
    public function getJson(string $url): ?array
    {
        $this->resetLastError();

        if (($reason = $this->isSafeUrl($url)) !== true) {
            return $this->setLastError($reason);
        }

        for ($redirects = 0; $redirects <= 3; $redirects += 1) {
            $response = $this->client->request('GET', $url, [
                'max_redirects' => 0,
                'timeout' => 5,
                'max_duration' => 10,
            ]);

            $status = $response->getStatusCode();

            if ($status >= 300 && $status < 400) {
                $headers = $response->getHeaders(false);

                if (!isset($headers['location'][0])) {
                    return $this->setLastError('error.redirect_no_location');
                }

                $url = $this->resolveRedirectUrl($url, $headers['location'][0]);

                if (($reason = $this->isSafeUrl($url)) !== true) {
                    return $this->setLastError($reason);
                }

                continue;
            }

            if ($status !== 200) {
                return $this->setLastError(sprintf('error.http_status %d', $status));
            }

            return $response->toArray();
        }

        return $this->setLastError('error.too_many_redirects');
    }

    /**
     * Gets a file from the given URL and saves it to the given location.
     * Optionally, a function can be called as the download is progressing.
     *
     * @param string $url URL of the file to locate.
     * @param string $destination Destination location for the file.
     * @param int $maxSize Optional maximum file size. Defaults to 10 MB,
     * @param callable(int $downloaded, ?int $total): void $onProgress Callback
     *        for any download progress.
     * @return bool true on success, false on any error.
     */
    public function getFile(
        string $url,
        string $destination,
        int $maxSize = 10_485_760,
        ?callable $onProgress = null,
    ): bool {
        $this->resetLastError();
        $file = fopen($destination, 'wb');

        if ($file === false) {
            // return $this->setLastError(sprintf('error.not_writable %s', $destination), false);
            return $this->setLastError('error.cant_write', false);
        }

        try {
            $response = $this->client->request('GET', $url, [
                'max_redirects' => 0,
                'timeout' => 10,
                'max_duration' => 300,
            ]);

            $status = $response->getStatusCode();

            if ($status !== 200) {
                return $this->setLastError(sprintf('error.http_status %d', $status), false);
            }

            $downloaded = 0;
            $length = $response->getHeaders(false)['content-length'][0] ?? null;
            $total = is_numeric($length) ? ((int) $length) : null;

            if (is_int($total) && $total > $maxSize) {
                return $this->setLastError('error.download_too_large', false);
            }

            foreach ($this->client->stream($response) as $chunk) {
                if ($chunk->isTimeout()) {
                    return $this->setLastError('error.download_timeout', false);
                }

                $content = $chunk->getContent();

                if ($content === '') {
                    continue;
                }

                if (fwrite($file, $content) === false) {
                    return $this->setLastError('error.cant_write', false);
                }

                $downloaded += strlen($content);

                if ($downloaded > $maxSize) {
                    return $this->setLastError('error.download_too_large', false);
                }

                if (is_callable($onProgress)) {
                    $onProgress($downloaded, $total);
                }
            }
        } catch (\Throwable $error) {
            return $this->setLastError($error->getMessage(), false);
        } finally {
            fclose($file);
        }

        return true;
    }

    /**
     * Converts a number of bytes into a human-readable format.
     *
     * @param int $bytes Bytes to convert.
     * @param int $decimals Optional number of decimals, defaults to 2.
     * @return string Human-readable bytes.
     */
    public function formatBytes(int $bytes, int $decimals = 2): string
    {
        $size = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        $factor = intval(floor((strlen((string) $bytes) - 1) / 3));

        if ($factor === 0) {
            $decimals = 0;
        }

        return sprintf("%.{$decimals}f %s", $bytes / (1024 ** $factor), $size[$factor]);
    }

    /**
     * Gets the last error message, which will be an empty string if no error
     * has occured.
     *
     * @return string Last error message.
     */
    public function getLastError(): string
    {
        return $this->lastError;
    }

    /**
     * Helper function for setting the last error message and returning null.
     *
     * @param string $lastError Last error message.
     * @param mixed $return The value to return.
     * @return mixed Whatever was passed as the return value.
     */
    protected function setLastError(string $lastError, mixed $return = null): mixed
    {
        $this->lastError = $lastError;
        return $return;
    }

    /**
     * Helper function for resetting the last error message.
     */
    protected function resetLastError(): void
    {
        $this->setLastError('');
    }

    /**
     * Resolves a redirect URL, since it could be a relative or an absolute URL.
     *
     * @param string $currentUrl The current URL.
     * @param string $location The location given, which might be relative.
     * @return string The full redirect URL.
     */
    protected function resolveRedirectUrl(
        string $currentUrl,
        string $location,
    ): string {
        $base = Uri::new($currentUrl);
        $target = $base->resolve($location);

        return (string) $target;
    }
}

