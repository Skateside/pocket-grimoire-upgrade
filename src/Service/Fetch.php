<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class Fetch
{
    /**
     * @var string $lastError The last error message that occurred.
     */
    protected string $lastError = '';

    public function __construct(
        private HttpClientInterface $client,
    ) {
    }

    /**
     * Gets the contents of the given source and attempts to parse it as JSON,
     * returning an array with a "success" key and a "body" key.
     *
     * @param string $source Source of the contents to get and parse.
     * @param bool $isAssoc Whether to parse the JSON as an associative array or
     *        an object. Defaults to array.
     * @return array{success: bool, body: mixed} Results of parsing the contents
     *         (if possible).
     */
    public function getJson(string $source, bool $isAssoc = true): mixed
    {
        $this->resetLastError();

        try {
            $response = $this->client->request('GET', $source, [
                'max_redirects' => 3,
                'timeout' => 5,
                'max_duration' => 10,
            ]);

            $status = $response->getStatusCode();

            if ($status < 200 || ($status >= 300 && $status !== 302)) {
                return $this->setLastError("Status code response {$status}");
            }

            return $response->toArray();
        } catch (\Throwable $error) {
            return $this->setLastError($error->getMessage());
        }
    }

    /**
     * Gets a file from the given URL and saves it to the given location.
     * Optionally, a function can be called as the download is progressing.
     *
     * @param string $url URL of the file to locate.
     * @param string $destination Destination location for the file.
     * @param callable(int $downloaded, ?int $total): void $onProgress Callback
     *        for any download progress.
     * @return bool true on success, false on any error.
     */
    public function getFile(
        string $url,
        string $destination,
        ?callable $onProgress = null,
    ): bool {
        $this->resetLastError();
        $file = fopen($destination, 'wb');

        if ($file === false) {
            return $this->setLastError("Unable to open {$destination} for writing", false);
        }

        $maxSize = 100 * 1024 * 1024; // 100 MB

        try {
            $response = $this->client->request('GET', $url, [
                'max_redirects' => 3,
                'timeout' => 10,
                'max_duration' => 300,
            ]);

            $status = $response->getStatusCode();

            if ($status < 200 || ($status >= 300 && $status !== 302)) {
                return $this->setLastError("Status code response {$status}", false);
            }

            $downloaded = 0;
            $length = $response->getHeaders(false)['content-length'][0] ?? null;
            $total = is_numeric($length) ? ((int) $length) : null;

            foreach ($this->client->stream($response) as $chunk) {
                if ($chunk->isTimeout()) {
                    return $this->setLastError('Download timed out', false);
                }

                $content = $chunk->getContent();

                if ($content === '') {
                    continue;
                }

                if (fwrite($file, $content) === false) {
                    return $this->setLastError('Unable to write downloaded file', false);
                }

                $downloaded += strlen($content);

                if ($downloaded > $maxSize) {
                    return $this->setLastError('Download file is too large', false);
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
     * @param string $laseError Last error message.
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
     * Converts a number of bytes into a human-readable format.
     *
     * @param int $bytes Bytes to convert.
     * @param int Decimals Optional number of decimals, defaults to 2.
     * @return string Human-readable bytes.
     */
    public static function formatBytes(int $bytes, int $decimals = 2): string
    {
        $size = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        $factor = floor((strlen($bytes) - 1) / 3);

        if ($factor === 0) {
            $decimals = 0;
        }

        return sprintf("%.{$decimals}f %s", $bytes / (1024 ** $factor), $size[$factor]);
    }
}

