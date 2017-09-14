import collections
import glob
import json
import os


Level = collections.namedtuple("Level", "id actions")


def read_events(directory):
    """
    Read all events from all log files in a given directory.

    Assumes that the lexicographic ordering of the log file names
    corresponds with the temporal ordering of the events in the log
    files.
    """
    log_files = glob.glob(os.path.join(directory, "*.json"))
    log_files.sort()

    events = []
    level_sequence = []

    for log_file in log_files:
        with open(log_file) as f:
            for line in f:
                events.append(json.loads(line))


    current_level = None
    actions = []
    for event in events:
        if event["0"] == "action":
            level_id = event["1"]["quest_id"]
            if level_id != current_level:
                if current_level is not None:
                    level_sequence.append(Level(current_level, actions))
                actions = []
                current_level = level_id
            actions.append(event)

    return events, level_sequence
