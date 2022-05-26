class AsgiDispatcher:
    def __init__(self, patterns, default):
        self.patterns = patterns
        self.default_app = default

    async def __call__(self, scope, receive, send):
        app = None
        request_path = scope['path']
        for pattern_prefix, pattern_app in self.patterns.items():
            if scope['type'] == 'http' and request_path.startswith(pattern_prefix):
                app = pattern_app
                break

        if app is None:
            app = self.default_app
        await app(scope, receive, send)
