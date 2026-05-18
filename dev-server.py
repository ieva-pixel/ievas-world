#!/usr/bin/env python3
"""
Dev server with aggressive no-cache headers.

Python's built-in `http.server` lets browsers cache static files, which means
Safari / Chrome / the Claude preview can each end up showing a different
stale version of the same page during development. This wrapper adds
`Cache-Control: no-store` to every response so the browser must re-fetch
every asset on every page load.

Usage (drop-in replacement for `python3 -m http.server`):
    python3 dev-server.py 3000 --directory site
"""

import argparse
import http.server
import socketserver
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Tell every browser to never cache anything served from this dev server.
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description='Static dev server with no-cache headers.')
    parser.add_argument('port', type=int, nargs='?', default=3000, help='Port (default: 3000)')
    parser.add_argument('--directory', default='.', help='Serve files from this directory')
    parser.add_argument('--bind', default='', help='Bind address (default: all interfaces)')
    args = parser.parse_args()

    handler = lambda *a, **kw: NoCacheHandler(*a, directory=args.directory, **kw)

    with socketserver.TCPServer((args.bind, args.port), handler) as httpd:
        host = args.bind or 'localhost'
        print(f'Serving {args.directory!r} at http://{host}:{args.port}/ (no-cache mode)')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nShutting down.')
            sys.exit(0)


if __name__ == '__main__':
    main()
