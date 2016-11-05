import pandas as pd
import os
from glob import glob

os.chdir("data")
data_sets = glob("*.csv")
dfs = [pd.read_csv(data_set) for data_set in data_sets if "_v" in data_set]
os.chdir("..")

list_of_schedule = []
for ind in dfs[1].index:
    list_of_schedule.append(dfs[1].ix[ind]["Schedule"])

schedules = list(set(list_of_schedule))
freq_of_schedule = {}.fromkeys(schedules,0)
for schedule in schedules:
    freq_of_schedule[schedule] = list_of_schedule.count(schedule)

import code
code.interact(local=locals())


#account for inflation over time
#account for national standards in costs of living (this might be bad though), I have to think on this
