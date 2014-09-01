# raspberry-midi

Listens on a MIDI port and a local virtual MIDI port, sends notes to StepperPlayer 
connected to a serial port (e.g. /dev/ttyACM0).


## Installation of M-Audio firmware on Raspberry / Arch Linux

```
# Arch Build System, gcc, etc.
pacman -S file base-devel abs

# fxload und M-Audio firmware
wget https://aur.archlinux.org/packages/mi/midisport-firmware/midisport-firmware.tar.gz
wget https://aur.archlinux.org/packages/fx/fxload/fxload.tar.gz
pacman -S file base-devel abs
tar xvzf fxload.tar.gz
cd fxload
makepkg -Acs --asroot
pacman -U fxload-*-armv6h.pkg.tar.xz
cd ..
tar xvzf midisport-firmware.tar.gz
cd midisport-firmware
makepkg -Acs --asroot
pacman -U midisport-firmware-*-any.pkg.tar.xz

# Node.js, Python 2.x (for node-gyp) and modules
pacman -S node python2
mkdir /app && cd /app
export PYTHON=$(which python2)
npm install

# systemd service
cp systemd/node-stepper-midi.service /etc/systemd/system
systemctl enable node-stepper-midi
systemctl start node-stepper-midi
```
