<?php

namespace App\Service;

class Fetch
{
    /**
     * @var string $lastError The last error message that occurred.
     */
    protected string $lastError = '';

    /**
     * Gets the status code from the given URL.
     *
     * @param string $source URL whose HTTP status code should be returned.
     * @return int Status code.
     */
    public function getStatusCode(string $source): int
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_URL => $source,
        ]);
        curl_exec($curl);
        $response_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        return $response_code;
    }

    /**
     * Gets the contents of the given URL.
     *
     * @param string $source URL whose contents should be returned.
     * @return string Contents from the given URL.
     */
    public function getContents(string $source): string
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $source,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER => false,
        ]);
        $contents = curl_exec($curl);
        curl_close($curl);

        return $contents;
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
        $status = $this->getStatusCode($source);

        if ($status < 200 || ($status >= 300 && $status !== 302)) {
            return $this->setLastError("Status code response {$status}");
        }

        $contents = $this->getContents($source);

        if ($contents === false) {
            return $this->setLastError("Can't get contents");
        }

        $decoded = json_decode($contents, $isAssoc);

        if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
            return $this->setLastError($this->getJsonError(json_last_error()));
        }

        return $decoded;
    }

    protected function getJsonError(int $code): string
    {
        switch ($code) {
        case JSON_ERROR_NONE:
            return 'No error';
        case JSON_ERROR_DEPTH:
            return 'Maximum stack depth exceeded';
        case JSON_ERROR_STATE_MISMATCH:
            return 'Underflow or the modes mismatch';
        case JSON_ERROR_CTRL_CHAR:
            return 'Unexpected control character found';
        case JSON_ERROR_SYNTAX:
            return 'Syntax error, malformed JSON';
        case JSON_ERROR_UTF8:
            return 'Malformed UTF-8 characters, possibly incorrectly encoded';
        default:
            return "Unknown JSON error: {$code}";
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
            $this->setLastError("Unable to open {$destination} for writing");
            return false;
        }

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FILE => $file,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_FAILONERROR => true,
            CURLOPT_NOPROGRESS => false,
            CURLOPT_PROGRESSFUNCTION => function (
                $resource,
                float $downloadTotal,
                float $downloaded,
                float $uploadTotal,
                float $uploaded,
            ) use ($onProgress): void {
                if (!is_callable($onProgress)) {
                    return; // No progress function, nothing to do.
                }

                $onProgress(
                    (int) $downloaded,
                    $downloadTotal > 0 ? (int) $downloadTotal : null,
                );
            },
        ]);

        try {
            if (curl_exec($curl) === false) {
                $this->setLastError(curl_error($curl));
                return false;
            }
        } finally {
            curl_close($curl);
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
     * @return null Null.
     */
    protected function setLastError(string $lastError): null
    {
        $this->lastError = $lastError;
        return null;
    }

    /**
     * Helper function for resetting the last error message.
     */
    protected function resetLastError(): void
    {
        $this->setLastError('');
    }
}

