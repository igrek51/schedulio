import re
from datetime import timedelta


class Duration(object):
    def __init__(self, duration_str: str):
        """
        :param duration_str: string in duration format, eg.: 5m, 10s, 100ms, 1d2h30m40s500ms, 0
        """
        duration_str = duration_str.strip().replace(' ', ''
        )
        if duration_str == '0':
            self.tdelta = timedelta(seconds=0)
            return

        regex = re.compile(r'((?P<days>\d+)d)?'
                           r'((?P<hours>\d+)h)?'
                           r'((?P<minutes>\d+)m(?!s))?'  # not confuse minutes with millis
                           r'((?P<seconds>\d+)s)?'
                           r'((?P<milliseconds>\d+)ms)?')
        match = regex.match(duration_str)
        if not match:
            raise ValueError(f'Invalid duration format: {duration_str}')

        parts = match.groupdict()
        time_params = {}
        for (name, param) in parts.items():
            if param:
                time_params[name] = int(param)
        if not time_params:
            raise ValueError(f'cant parse {duration_str} as duration')

        self.tdelta = timedelta(**time_params)

    def __repr__(self) -> str:
        return self.__str__()

    @property
    def seconds(self) -> float:
        return self.tdelta.total_seconds()
