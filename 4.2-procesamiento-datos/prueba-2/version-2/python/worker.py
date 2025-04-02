import sys

from pyscript import sync


print("Worker running:", sys.version)


def take_a_long_time():
    print("Sleeping!")
    import time
    time.sleep(3)
    print("Awake!")
    return 42


sync.take_a_long_time = take_a_long_time
