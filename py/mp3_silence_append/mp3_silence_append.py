#!/usr/bin/python3
import subprocess
import struct
import wave
import sys


def exec_lame(cmd):
    # Example:
    #   exec_lame(['path/to/lame.exe', '--quiet', '-V2', 'a.wav', 'b.mp3'])
    # For more info:
    #   https://svn.code.sf.net/p/lame/svn/trunk/lame/USAGE
    try:
        status = subprocess.call(cmd)
        if status != 0:
            print(f'Lame returns error status ({status})')
            return status
    except FileNotFoundError:
        print(f'Lame executable not found by path "{lame}"')
        return -1
    return 0


def append_silence(audio, millisec, rate):
    samples_num = int(millisec * rate / 1000)
    for i in range(samples_num):
        audio.append(0)


def main():
    if len(sys.argv) != 2:
        print('Program creates files "buffer.wav" and "[filename]__converted.mp3"')
        print('Has to be only one argument (mp3 file)')
        return
    # TODO: All algorithms ignores channels number, assumed as mono.
    lame = 'C:/Program Files (x86)/Lame For Audacity/lame.exe'
    f_in = sys.argv[1]
    f_out = f_in[:-4] + '__converted.mp3'
    f_buff = f_in[:-4] + '.wav'
    print(f_in)
    print(f_out)
    print(f_buff)
    # Converts input mp3 file into buffer wave file.
    if 0 != exec_lame([lame, '--decode', f_in, f_buff]):
        return
    # Reads buffer wave file.
    f = wave.open(f_buff, 'r')
    (nchannels, sampwidth, framerate, nframes, comptype, compname) = f.getparams()
    raw = f.readframes(nframes)
    audio = bytearray(raw)
    duration = 1000.0 * nframes / framerate
    f.close()
    print('----------------')
    print(f'channels        : {nchannels}')
    print(f'sample width    : {sampwidth}')
    print(f'framerate       : {framerate}')
    print(f'samples number  : {nframes}')
    print(f'compression type: {comptype} ({compname})')
    print(f'size (bytes)    : {len(raw)}')
    print(f'duration (milli): {duration}')
    # Appends silence to the end.
    silence_len = 3500 - duration
    if silence_len <= 0:
        print('No need to change duration')
    else:
        append_silence(audio, silence_len, framerate)
        print(f'{silence_len} milliseconds of silence added')
    # Rewrite buffer wave file.
    f = wave.open(f_buff, 'w')
    f.setparams((nchannels, sampwidth, framerate, len(audio), comptype, compname))
    for byt in audio:
        f.writeframesraw(byt.to_bytes(1, 'big'))
    f.close()
    print('Buffer rewrited')
    print('----------------')
    # Converts buffer wave file into output mp3 file.
    if 0 != exec_lame([lame, '-V2', f_buff, f_out]):
        return
    print(f'Done "{f_out}"')


main()
