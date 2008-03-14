#!/usr/bin/env python
# encoding: utf-8
"""
untitled.py

Created by Fabian Jakobs on 2008-03-13.
Copyright (c) 2008 __MyCompanyName__. All rights reserved.
"""

import sys
import os
import os.path
import subprocess


def get_file_info(filename):
    if not os.path.exists(filename):
        print "Error: Unable to find file '%'" % filename
        sys.exit(1)

    cmd = "identify %s" % filename    
    pipe = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE).stdout
    lines = pipe.readlines()
    try:
        info = lines[0].split()
    except IndexError:
        print "Error running 'identify %s', read attributes are: " % filename, lines
        sys.exit(1)

    width, height = [int(x) for x in info[2].split("x")]
    return (width, height)
    
    
def split_grid(file, source, dest, border):
    
    source_file = os.path.join(source, file) + ".png"
    dest_file = os.path.join(dest, file)
    
    width, height = get_file_info(source_file)
    
    crop_cmd = "convert %s -crop %sx%s+%s+%s +repage %s"
    
    # split
    os.system(crop_cmd % (source_file, border, border, 0, 0, dest_file + "-tl.png"))
    os.system(crop_cmd % (source_file, border, border, border, 0, dest_file + "-t.png"))
    os.system(crop_cmd % (source_file, border, border, width-border, 0, dest_file + "-tr.png"))

    os.system(crop_cmd % (source_file, border, height-2*border, 0, border, dest_file + "-l.png"))
    os.system(crop_cmd % (source_file, 40, height-2*border, border, border, dest_file + "-c.png"))
    os.system(crop_cmd % (source_file, border, height-2*border, width-border, border, dest_file + "-r.png"))

    os.system(crop_cmd % (source_file, border, border, 0, height-border, dest_file + "-bl.png"))
    os.system(crop_cmd % (source_file, border, border, border, height-border, dest_file + "-b.png"))
    os.system(crop_cmd % (source_file, border, border, width-border, height-border, dest_file + "-br.png"))
        

def combine_images(files, combined, horizontal, config):

    montage_cmd = "montage -geometry +0+0 -gravity NorthWest -tile %s -background None %s %s"    
    
    if horizontal:
        orientation = "x1"
    else:
        orientation = "1x"
    
    # combine
    clips = []
    top = 0
    left = 0
    for file in files:
        clips.append(file)            
        width, height = get_file_info(file)

        config.append('"%s": ["%s", %s, %s, %s, %s]' % (file, combined, -left, -top, width, height))
            
        if horizontal:
            left += width
        else:
            top += height

    os.system(montage_cmd % (orientation, " ".join(clips), combined))
    
    width, height = get_file_info(combined)
    config.append('"%s": ["%s", 0, 0, %s, %s]' % (combined, combined, width, height))
        

def add_file(file, config):
    width, height = get_file_info(file)
    config.append('"%s": ["%s", 0, 0, %s, %s]' % (file, file, width, height))


def main():
    files = [
        "Button-Checked-Fokus",
        "Button-Checked",
        "Button-Default-Fokus",
        "Button-Default",
        "Button-Hover",
        "Button-Normal-Fokus",
        "Button-Normal",
        "Button-Pressed"        
    ]
    
    for file in files:
        split_grid(file, "source", "button", 4)

    config = []
    
    clips = []
    for file in files:
        for suffix in ["tl", "t" , "tr", "bl", "b", "br"]:
            clips.append("button/%s-%s.png" % (file, suffix))
    combine_images(clips, "button/Button-Combined.png", False, config)
                   
    clips = []
    for file in files:
        for suffix in ["l", "r"]:
            clips.append("button/%s-%s.png" % (file, suffix))            
    combine_images(clips, "button/Button-Combined-Center.png", True, config)
    
    for file in files:
        add_file("button/%s-c.png" % file, config)

    # pane
    split_grid("Pane", "source", "pane", 6)
    clips = []
    for suffix in ["tl", "t" , "tr", "bl", "b", "br"]:
        clips.append("pane/%s-%s.png" % ("Pane", suffix))
    combine_images(clips, "pane/Pane-Combined.png", False, config)
    
    clips = []
    for suffix in ["l", "r"]:
        clips.append("pane/%s-%s.png" % ("Pane", suffix))            
    combine_images(clips, "pane/Pane-Combined-Center.png", True, config)  

    add_file("pane/Pane-r.png", config)  


    print "        " + ",\n        ".join(config)
    
if __name__ == '__main__':
	main()

