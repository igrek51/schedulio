from nuclear import CliBuilder

from schedulio.api.server import run_server


def main():
    cli = CliBuilder(log_error=True)

    @cli.add_command("run")
    def run():
        """
        Run server
        """
        run_server()

    cli.run()
