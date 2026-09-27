LEVELS={
1:("WATCH","Flood Watch","Water level has reached the configured watch threshold."),
2:("ADVISORY","Flood Advisory","Water level has reached the configured advisory threshold. Stay alert."),
3:("WARNING","Flood Warning","Water level has reached the configured warning threshold. Prepare to move."),
4:("EVACUATE","Evacuation Alert","Water level has reached the configured evacuation threshold. Follow local emergency instructions and move to a registered safe location."),
}
def level_for(sensor, water_level):
    if water_level >= sensor.level4_m: return 4
    if water_level >= sensor.level3_m: return 3
    if water_level >= sensor.level2_m: return 2
    if water_level >= sensor.level1_m: return 1
    return 0

def details(level): return LEVELS.get(level,("NORMAL","Monitoring","Water level is below the configured alert thresholds."))
