---
type: post
title: Setup de Arch Linux
description: Instalación de Arch Linux en Virtual Box
lang: es
image: ../../images/blog/arch/arch.png
---

## Creación de máquina virtual

- Crear una nueva máquina virtual
- Click derecho en la nueva máquina virtual creada, seleccionar `settings`
- En la sección `General`, pestaña `Features`, seleccionar la opción `Bidirectional` en `Shared Clipboard`

![VirtualBox Settings General Features](@images/blog/virtualbox-setup/virtualbox-settings-general-features.png)

- En la sección `Display`, pestaña `Screen`, seleccionar la opción `VBoxSVGA` en `Graphics Controller`

![VirtualBox Settings Display Graphics Controller](@images/blog/virtualbox-setup/virtualbox-settings-display-graphics-controller.png)

- Click `OK` para guardar los cambios
- Iniciar la máquina virtual

```bash
loadkeys la-latin1
setfont ter-120b
pacman -Sy archinstall
archinstall
```

## Archinstall

- **Archinstall language**: `English`
- **Locales**  
**›** **Keyboard layout**: `la-latin1`
- **Mirrors and repositories**  
**›** **Select regions**: `Brazil`
- **Disk configuration**  
**›** **Partitioning**:  
**›** **Use a best-effort default partition layout**: `ATA VBOX HARDDISK`  
**›** **Filesystem**: `ext4`  
**›** **Would you like to create a separate partition for /home?**: `No`  
- **Authentication**:  
**›** **User account**: `Add a user`  
**›** **Should "user" be a superuser (sudo)?**: `yes`  
**›** **Confirm and exit**
- **Profile**:  
**›** **Type**:  
**›** **Desktop**: `Bspwm` (It'll install: `bspwm`, `dmenu`, `rxvt-unicode`, `sxhkd`, `xdo`)  
**›** **Graphics driver**: `VirtualBox (open-source)` (It'll install: `mesa`, `xorg-server`, `xorg-xinit`)
- **Applications**:  
**›** **Audio**: `pipewire`
- **Network configuration**: `Copy ISO network configuration to installation`
- **Timezone**: `America/Argentina/Buenos_Aires`
- **Install**:  
**›** **The specified configuration will be applied. Would you like to continue?**: `Yes`
- **Exit archinstall**
- `poweroff`

## Últimos ajustes de la máquina virtual

- Click derecho en la nueva máquina virtual creada, seleccionar `settings`
- En la sección `System`, pestaña `Motherboard`, destildar la opción `Optical` en `Boot Device Order (BIOS only)`

![VirtualBox Settings System Motherboad Boot Device Order](@images/blog/virtualbox-setup/virtualbox-settings-system-motherboard-boot-device-order.png)

- En la sección `Storage`, apartado `Motherboard`, click derecho sobre la imgen ISO y click en `Remove`

![Storage Config](@images/blog/virtualbox-setup/virtualbox-settings-storage-controlleride.png)

Click `OK` para guardar los cambios

Iniciar la máquina virtual  
Iniciar sesión  
Presionar `ctrl` + `alt` + `F2` para abrir una nueva consola  
Iniciar sesión nuevamente

```bash
mkdir -p $HOME/.config/{bspwm,sxhkd}
cp /usr/share/doc/bspwm/examples/bspwmrc $HOME/.config/bspwm/bspwmrc
cp /usr/share/doc/bspwm/examples/sxhkdrc $HOME/.config/sxhkd/sxhkdrc
sudo pacman -S kitty virtualbox-guest-utils
sudo systemctl enable --now vboxservice
```

Agregar `pkill -x VBoxClient; sleep 1 && VBoxClient-all &` al archivo `$HOME/.config/bspwm/bspwmrc`  
Modificar `terminal emulator` en el archivo `$HOME/.config/sxhkd/sxhkdrc` por `/usr/bin/kitty`

```bash
# terminal emulator
super + Return
  /usr/bin/kitty
```

Reiniciar  
Iniciar sesión  
Presionar `super` + `Return` para abrir `kitty`

**AHORA PODÉS COPIAR Y PEGAR**

## Instalar herramientas desde Pacman

### Pacman — Sistema

```bash
sudo pacman -S base-devel binutils cmake gtk3 man-db noto-fonts-emoji numlockx p7zip papirus-icon-theme plocate polybar qt5ct ttf-hack-nerd xclip xorg-xset dunst libnotify
```

### Pacman — Misc

```bash
sudo pacman -S firefox git jq less neovim nodejs npm rofi rust tree unzip zip
```

## Instalar `paru` para instalar herramientas desde AUR

```bash
git clone https://aur.archlinux.org/paru.git
cd paru
makepkg -si
cd ..
rm -rf paru
```

### Instalar herramientas desde AUR

#### Paru (AUR) — Sistema

```bash
paru -S bibata-cursor-theme-bin catppuccin-gtk-theme-mocha
```

## Crear directorios y archivos de configuración

```bash
mkdir -p $HOME/.config/{kitty,polybar,nvim,colors,gtk-3.0,gtk-4.0,rofi,dunst,vpn}
mkdir $HOME/.config/bspwm/scripts
mkdir $HOME/.config/sxhkd/scripts
mkdir $HOME/.config/polybar/scripts
touch $HOME/.config/bspwm/scripts/bspwm_resize
touch $HOME/.config/sxhkd/scripts/keybinds.sh
touch $HOME/.config/kitty/kitty.conf
touch $HOME/.config/polybar/launch.sh
touch $HOME/.config/polybar/scripts/{target.sh,target.txt,vpn.sh,ip.sh}
touch $HOME/.config/colors/{colors.ini,colors.sh,colors.py}
touch $HOME/.config/rofi/keybinds.rasi
touch $HOME/.config/gtk-3.0/settings.ini
touch $HOME/.config/gtk-4.0/settings.ini
touch $HOME/.xprofile
touch $HOME/.Xresources
chmod +x $HOME/.config/bspwm/scripts/bspwm_resize
chmod +x $HOME/.config/sxhkd/scripts/keybinds.sh
chmod +x $HOME/.config/polybar/launch.sh
chmod +x $HOME/.config/polybar/scripts/{target.sh,vpn.sh,ip.sh}
```

## bash

### $HOME/.bashrc

> Se ejecuta automáticamente cada vez que se inicia una terminal interactiva de Bash. Se utiliza para personalizar el entorno de trabajo, definir variables de entorno, crear alias y funciones, y modificar el prompt.

```bash
cat > $HOME/.bashrc << 'EOF'
source $HOME/.config/colors/colors.sh

export LS_COLORS="di=1;38;2;159;239;0:ln=1;38;2;46;231;186:ex=1;38;2;159;239;0:*.py=38;2;255;175;0:*.sh=38;2;159;239;0:*.json=38;2;159;0;255:*.txt=38;2;164;177;205:*.md=38;2;164;177;205:*.gnmap=38;2;255;175;0:*.nmap=38;2;255;175;0:*.xml=38;2;255;175;0:*.pcap=38;2;0;134;255:*.pcapng=38;2;0;134;255:*.zip=38;2;243;139;168:*.tar=38;2;243;139;168:*.gz=38;2;243;139;168:*.7z=38;2;243;139;168"

[[ $- != *i* ]] && return

export _JAVA_AWT_WM_NONREPARENTING=1
export WPSCAN_API_TOKEN=

alias ls='ls --color=auto'
alias burp='/usr/bin/burpsuite > /dev/null 2>&1 & disown'
alias fire='/usr/bin/firefox > /dev/null 2>&1 & disown'
alias tor='/usr/bin/torbrowser-launcher > /dev/null 2>&1 & disown'
alias wire='/usr/bin/wireshark > /dev/null 2>&1 & disown'

_git_prompt() {
    local branch
    branch=$(git symbolic-ref --short HEAD 2>/dev/null) || branch=$(git rev-parse --short HEAD 2>/dev/null)
    [[ -z "$branch" ]] && return
    local dirty=""
    [[ -n $(git status --porcelain 2>/dev/null) ]] && dirty="*"
    echo -e " ${ANSI_SECONDARY_A}(${branch}${dirty})${COLOR_RESET}"
}
PS1="\[${ANSI_FG_STRONG}\]\w\[${COLOR_RESET}\]\$(_git_prompt) "

target() {
    local target_file="$HOME/.config/polybar/scripts/target.txt"
    local usage="\n[${ANSI_WARNING}*${COLOR_RESET}] Usage: target [${ANSI_DANGER}ip${COLOR_RESET}] or target [${ANSI_DANGER}ip${COLOR_RESET}:${ANSI_DANGER}port${COLOR_RESET}]\n\n  target 10.10.10.10        → set target IP in Polybar\n  target 10.10.10.10:8080   → set target IP and port in Polybar\n  target                    → clear target from Polybar\n"
    if [[ $# -eq 0 ]]; then
        : > "$target_file"
        dunstify -u normal "[ Target ]" "Target cleared"
        return 0
    elif [[ $# -ne 1 ]]; then
        echo -e "$usage"
        return 1
    fi
    local input="$1"
    local ip="${input%%:*}"
    local port="${input##*:}"
    [[ "$ip" == "$port" ]] && port=""
    if ! [[ "$ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
        echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: '$ip' is not a valid IP address"
        echo -e "$usage"
        dunstify -u critical "[ Target ]" "'$ip' is not a valid IP address"
        return 1
    fi
    local octet
    for octet in ${ip//./ }; do
        if (( octet > 255 )); then
            echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: invalid IP (octets must be between 0 and 255)"
            dunstify -u critical "[ Target ]" "Invalid IP: octets must be between 0 and 255"
            return 1
        fi
    done
    if [[ -n "$port" ]]; then
        if ! [[ "$port" =~ ^[0-9]+$ ]] || (( port < 1 || port > 65535 )); then
            echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: invalid port (must be between 1 and 65535)"
            dunstify -u critical "[ Target ]" "Invalid port: must be between 1 and 65535"
            return 1
        fi
        echo "$ip:$port" > "$target_file"
        dunstify -u normal "[ Target ]" "Target set to $ip:$port"
    else
        echo "$ip" > "$target_file"
        dunstify -u normal "[ Target ]" "Target set to $ip"
    fi
}

_ports_error() {
    local usage="[${ANSI_WARNING}*${COLOR_RESET}] Usage: ports [${ANSI_DANGER}-f${COLOR_RESET}] <${ANSI_DANGER}file${COLOR_RESET}>
  ports lookup.gnmap      → parses grepable nmap output
  ports lookup.nmap       → parses normal nmap output
  ports lookup.xml        → parses XML nmap output
  ports -f lookup.gnmap   → also includes filtered ports"
    echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: $1\n"
    echo -e "$usage\n"
}
ports() {
    local include_filtered=0
    local file=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -f)
                include_filtered=1
                shift
                ;;
            *)
                if [[ -n "$file" ]]; then
                    _ports_error "too many arguments"
                    dunstify -u critical "[ Ports ]" "Too many arguments"
                    return 1
                fi
                file="$1"
                shift
                ;;
        esac
    done
    if [[ -z "$file" ]]; then
        _ports_error "no file specified"
        dunstify -u critical "[ Ports ]" "No file specified"
        return 1
    fi
    if [[ ! -f "$file" ]]; then
        _ports_error "'$file' is not a valid file"
        dunstify -u critical "[ Ports ]" "'$file' is not a valid file"
        return 1
    fi
    local state_regex="open"
    [[ $include_filtered -eq 1 ]] && state_regex="open|filtered"
    local result
    case "$file" in
        *.gnmap)
            result=$(grep -oP "\d{1,5}/(${state_regex})" "$file" | awk -F'/' '{print $1}' | sort -un | xargs | tr ' ' ',')
            ;;
        *.nmap)
            result=$(grep -oP "^\s*\d{1,5}/\w+\s+(${state_regex})" "$file" | grep -oP '^\s*\d+' | tr -d ' ' | sort -un | xargs | tr ' ' ',')
            ;;
        *.xml)
            result=$(grep -oP "state=\"(${state_regex})\"[^>]*" "$file" | grep -B0 "" "$file" | true)
            result=$(grep -oP 'portid="\K\d+(?=".*?state="(?:'"${state_regex}"')")' "$file" | sort -un | xargs | tr ' ' ',')
            ;;
        *)
            _ports_error "unrecognized file extension (expected .gnmap, .nmap or .xml)"
            dunstify -u critical "[ Ports ]" "Unrecognized file extension"
            return 1
            ;;
    esac
    if [[ -z "$result" ]]; then
        echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] No open$([[ $include_filtered -eq 1 ]] && echo "/filtered") ports found in '$file'\n"
        dunstify -u low "[ Ports ]" "No open$([[ $include_filtered -eq 1 ]] && echo "/filtered") ports found in '$file'"
        return 1
    fi
    echo "$result"
    echo -n "$result" | xclip -sel clip
    dunstify -u normal "[ Ports ]" "Ports copied to clipboard: $result"
}

_pyvenv_error() {
    echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: $1\n"
}

_pyvenv_success() {
    echo -e "\n[${ANSI_SUCCESS}+${COLOR_RESET}] $1"
}

pyvenv() {
    local venv_dir="venv"
    local libs=("$@")

    if [[ ${#libs[@]} -eq 0 ]]; then
        if [[ -d "$venv_dir" ]]; then
            [[ -n "$VIRTUAL_ENV" ]] && deactivate
            rm -rf "$venv_dir"
            _pyvenv_success "venv removed\n"
        else
            python3 -m venv "$venv_dir"
            source "$venv_dir/bin/activate"
            _pyvenv_success "venv created and activated\n"
        fi
        return 0
    fi

    if [[ ! -d "$venv_dir" ]]; then
        python3 -m venv "$venv_dir"
        _pyvenv_success "venv created"
    fi

    if [[ -z "$VIRTUAL_ENV" ]]; then
        source "$venv_dir/bin/activate"
    fi

    echo -e "\n[${ANSI_SUCCESS}*${COLOR_RESET}] Installing libraries: ${libs[*]}\n"
    python3 -m pip install "${libs[@]}"
}

_vpn_error() {
    local usage="[${ANSI_WARNING}*${COLOR_RESET}] Usage: vpn <${ANSI_DANGER}htbm${COLOR_RESET}|${ANSI_DANGER}htbc${COLOR_RESET}|${ANSI_DANGER}htba${COLOR_RESET}|${ANSI_DANGER}thm${COLOR_RESET}>

  vpn htbs  → connect to HackTheBox Starting Point
  vpn htbm  → connect to HackTheBox Machines
  vpn htbc  → connect to HackTheBox Competitive
  vpn htba  → connect to HackTheBox Academy
  vpn thm   → connect to TryHackMe"
    echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: $1\n"
    [[ "$2" != "no-usage" ]] && echo -e "$usage\n"
}

vpn() {
    local config_dir="$HOME/.config/vpn"
    if [[ $# -eq 0 ]]; then
        _vpn_error "no arguments provided"
        dunstify -u critical "[ VPN ]" "No arguments provided"
        return 1
    fi
    if [[ $# -gt 1 ]]; then
        _vpn_error "too many arguments"
        dunstify -u critical "[ VPN ]" "Too many arguments"
        return 1
    fi
    local config
    case "$1" in
        htbs)  config="$config_dir/htbs.ovpn" ;;
        htbm)  config="$config_dir/htbm.ovpn" ;;
        htbc) config="$config_dir/htbc.ovpn" ;;
        htba) config="$config_dir/htba.ovpn" ;;
        thm)  config="$config_dir/thm.ovpn" ;;
        *)
            _vpn_error "unknown VPN '$1' (expected htb, htbc, htba or thm)"
            dunstify -u critical "[ VPN ]" "Unknown VPN '$1'"
            return 1
            ;;
    esac
    if [[ ! -f "$config" ]]; then
        _vpn_error "config file not found at '$config'" "no-usage"
        dunstify -u critical "[ VPN ]" "Config file not found at '$config'"
        return 1
    fi
    echo -e "\n[${ANSI_WARNING}*${COLOR_RESET}] Connecting to $1 VPN\n"
    dunstify -u normal "[ VPN ]" "Connecting to $1 VPN"
    sudo openvpn --config "$config"
}

clip() {
    if [[ $# -eq 0 ]]; then
        echo -e "\n[${ANSI_WARNING}*${COLOR_RESET}] Usage: clip <${ANSI_DANGER}file${COLOR_RESET}>\n"
        return 1
    fi
    if [[ $# -gt 1 ]]; then
        echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: too many arguments\n"
        echo -e "\n[${ANSI_WARNING}*${COLOR_RESET}] Usage: clip <${ANSI_DANGER}file${COLOR_RESET}>\n"
        return 1
    fi
    if [[ ! -f "$1" ]]; then
        echo -e "\n[${ANSI_DANGER}!${COLOR_RESET}] Error: '$1' is not a valid file\n"
        dunstify -u critical "[ CLIP ]" "'$1' is not a valid file"
        return 1
    fi
    xclip -sel clip < "$1"
    echo -e "\n[${ANSI_SUCCESS}+${COLOR_RESET}] '$1' copied to clipboard\n"
    dunstify -u normal "[ CLIP ]" "'$1' copied to clipboard"
}
EOF
```

## bspwm

### $HOME/.config/bspwm/bspwmrc

> Se ejecuta cada vez que se inicia una sesión de `bspwm`. Define la configuración del gestor de ventanas, como la cantidad de escritorios, el tamaño de los bordes y los espacios entre ventanas, además de iniciar los servicios y aplicaciones que deben ejecutarse automáticamente al comenzar la sesión, como `sxhkd`, `dunst` y `polybar`.

```bash
cat > $HOME/.config/bspwm/bspwmrc << 'EOF'
#!/bin/sh

pgrep -x sxhkd > /dev/null || sxhkd &

bspc monitor -d I II III IV V VI VII VIII IX X
bspc config border_width         1
bspc config window_gap           5
bspc config split_ratio          0.5
bspc config focused_border_color   "#9fef00"
bspc config normal_border_color    "#1a2433"
bspc config active_border_color    "#838ea4"
bspc config borderless_monocle   true
bspc config gapless_monocle      false

/usr/bin/numlockx on &
/usr/bin/xsetroot -cursor_name left_ptr &
/usr/bin/xsetroot -solid "#141d2b" &
pkill -x VBoxClient; sleep 1 && VBoxClient --clipboard && VBoxClient --display &
pgrep -x dunst > /dev/null || dunst &
$HOME/.config/polybar/launch.sh &
/usr/bin/xset r rate 250 40
EOF
```

### $HOME/.config/bspwm/scripts/bspwm_resize

> Script auxiliar utilizado por `sxhkd` para redimensionar la ventana enfocada mediante atajos de teclado. Detecta automáticamente si la ventana está en modo flotante o mosaico (`tiled`) y ajusta el tamaño utilizando el método apropiado para cada caso, permitiendo que los mismos atajos funcionen correctamente en ambos modos.

```bash
cat > $HOME/.config/bspwm/scripts/bspwm_resize << 'EOF'
#!/usr/bin/env sh

if bspc query -N -n focused.floating > /dev/null; then
	step=20
else
	step=100
fi

case "$1" in
	west) dir=right; falldir=left; x="-$step"; y=0;;
	east) dir=right; falldir=left; x="$step"; y=0;;
	north) dir=top; falldir=bottom; x=0; y="-$step";;
	south) dir=top; falldir=bottom; x=0; y="$step";;
esac

bspc node -z "$dir" "$x" "$y" || bspc node -z "$falldir" "$x" "$y"
EOF
```

## sxhkd

### $HOME/.config/sxhkd/sxhkdrc

> Define los atajos de teclado utilizados durante la sesión. Asocia combinaciones de teclas con comandos o acciones del gestor de ventanas, permitiendo abrir aplicaciones, cambiar el estado o tamaño de las ventanas, navegar entre escritorios y ejecutar scripts personalizados sin necesidad de utilizar el mouse.

```bash
cat > $HOME/.config/sxhkd/sxhkdrc << 'EOF'
# Open terminal
super + Return
	/usr/bin/kitty

# Reload sxhkd
super + Escape
	pkill -USR1 -x sxhkd && dunstify -u low "sxhkd" "Config reloaded"

# Quit/Restart bspwm
super + shift + {q,r}
	bspc {quit,wm -r}

# Close/Kill window
super + {_,shift + }w
	bspc node -{c,k}

# Toggle layout
super + m
	bspc desktop -l next

# Set window state
super + {t,s,f}
	bspc node -t {tiled,floating,fullscreen}

# Focus/Swap window
super + {_,shift + }{Left,Down,Up,Right}
	bspc node -{f,s} {west,south,north,east}

# Next/Prev window
super + {_,shift + }c
	bspc node -f {next,prev}.local.!hidden.window

# Next/Prev desktop
super + bracket{left,right}
	bspc desktop -f {prev,next}.local

# Focus/Send desktop
super + {_,shift + }{1-9,0}
	bspc {desktop -f,node -d} '^{1-9,10}'

# Move floating
super + alt + shift + {Left,Down,Up,Right}
	bspc node -v {-10 0,0 10,0 -10,10 0}

# Resize window
super + alt + {Left,Down,Up,Right}
	$HOME/.config/bspwm/scripts/bspwm_resize {west,south,north,east}

# Show keybinds
super + k
	$HOME/.config/sxhkd/scripts/show_keybinds.sh
EOF
```

### $HOME/.config/sxhkd/scripts/keybinds.sh

> Genera una lista de los atajos de teclado definidos en `sxhkdrc` y la muestra mediante `rofi`. Analiza automáticamente el archivo de configuración, extrae las descripciones y sus combinaciones de teclas correspondientes, creando una referencia rápida de todos los atajos disponibles sin necesidad de mantener una lista separada.

```bash
cat > $HOME/.config/sxhkd/scripts/keybinds.sh << 'EOF'
#!/bin/bash
SXHKDRC="$HOME/.config/sxhkd/sxhkdrc"
THEME="$HOME/.config/rofi/keybinds.rasi"
KEY_WIDTH=46

parse_binds() {
  local desc=""
  while IFS= read -r line; do
    if [[ "$line" =~ ^#\ (.*) ]]; then
      desc="${BASH_REMATCH[1]}"
    elif [[ -n "$line" && ! "$line" =~ ^[[:space:]] && -n "$desc" ]]; then
      key=$(echo "$line" | sed -E 's/\bsuper\b/SUPER/g; s/\bshift\b/SHIFT/g; s/\bctrl\b/CTRL/g; s/\balt\b/ALT/g')
      padded_key=$(printf "%-${KEY_WIDTH}s" "$key")
      printf "<span foreground='#cba6f7' weight='bold'>%s</span><span foreground='#6c7086'>→  </span><span foreground='#a6adc8'>%s</span>\n" "$padded_key" "$desc"
      desc=""
    fi
  done < "$SXHKDRC"
}

parse_binds | rofi -dmenu -theme "$THEME" -mesg "Keybindings" -markup-rows -no-custom > /dev/null
EOF
```

## Colors

### $HOME/.config/colors/colors.sh

> Centraliza la definición de la paleta de colores utilizada por los scripts de Bash. Define cada color tanto en formato hexadecimal como en secuencias ANSI de 24 bits (truecolor), permitiendo reutilizar una apariencia consistente en la terminal, mensajes informativos y notificaciones sin duplicar valores en distintos archivos.

```bash
cat > $HOME/.config/colors/colors.sh << 'EOF'
COLOR_BG="#141d2b"
COLOR_BG_ALT="#1a2433"
COLOR_FG="#a4b1cd"
COLOR_FG_STRONG="#fbfbfb"
COLOR_FG_MUTED="#838ea4"

COLOR_ACCENT="#9fef00"

COLOR_SUCCESS="#9fef00"
COLOR_WARNING="#ffaf00"
COLOR_DANGER="#ff3e3e"
COLOR_INFO="#0086ff"

COLOR_SECONDARY_A="#9f00ff"
COLOR_SECONDARY_B="#2ee7b6"

COLOR_RESET="\033[0m"

_hex() { local h="${1#"#"}"; echo "\e[38;2;$((16#${h:0:2}));$((16#${h:2:2}));$((16#${h:4:2}))m"; }

ANSI_BG=$(_hex "$COLOR_BG")
ANSI_BG_ALT=$(_hex "$COLOR_BG_ALT")
ANSI_FG=$(_hex "$COLOR_FG")
ANSI_FG_STRONG=$(_hex "$COLOR_FG_STRONG")
ANSI_FG_MUTED=$(_hex "$COLOR_FG_MUTED")
ANSI_ACCENT=$(_hex "$COLOR_ACCENT")
ANSI_SUCCESS=$(_hex "$COLOR_SUCCESS")
ANSI_WARNING=$(_hex "$COLOR_WARNING")
ANSI_DANGER=$(_hex "$COLOR_DANGER")
ANSI_INFO=$(_hex "$COLOR_INFO")
ANSI_SECONDARY_A=$(_hex "$COLOR_SECONDARY_A")
ANSI_SECONDARY_B=$(_hex "$COLOR_SECONDARY_B")
EOF
```

### $HOME/.config/colors/colors.py

> Centraliza la definición de la paleta de colores utilizada por los scripts de Python. Expone los colores como constantes para que puedan reutilizarse fácilmente en distintos programas, manteniendo una apariencia consistente y evitando la duplicación de valores.

```bash
cat > $HOME/.config/colors/colors.py << 'EOF'
BG           = "#141d2b"
BG_ALT       = "#1a2433"
FG           = "#a4b1cd"
FG_STRONG    = "#fbfbfb"
FG_MUTED     = "#838ea4"

ACCENT       = "#9fef00"

SUCCESS      = "#9fef00"
WARNING      = "#ffaf00"
DANGER       = "#ff3e3e"
INFO         = "#0086ff"

SECONDARY_A  = "#9f00ff"
SECONDARY_B  = "#2ee7b6"
EOF
```

### $HOME/.config/colors/colors.ini

> Centraliza la definición de la paleta de colores utilizada por las aplicaciones que emplean el formato INI, como `polybar`. Proporciona un único lugar donde definir los colores para que puedan reutilizarse en distintos archivos de configuración, manteniendo una apariencia consistente y facilitando su mantenimiento.

```bash
cat > $HOME/.config/colors/colors.ini << 'EOF'
[colors]
bg          = #141d2b
bg-alt      = #1a2433
fg          = #a4b1cd
fg-strong   = #fbfbfb
fg-muted    = #838ea4

accent      = #9fef00

success     = #9fef00
warning     = #ffaf00
danger      = #ff3e3e
info        = #0086ff

secondary-a = #9f00ff
secondary-b = #2ee7b6
EOF
```

## Dunst

### $HOME/.config/dunst/dunstrc

> Configura el comportamiento y la apariencia de `dunst`, el servidor de notificaciones utilizado durante la sesión. Define aspectos como la posición, el tamaño, la tipografía, los colores, la duración de las notificaciones y su apariencia según el nivel de urgencia, permitiendo mantener un estilo visual consistente con el resto del entorno de escritorio.

```bash
cat > $HOME/.config/dunst/dunstrc << 'EOF'
[global]
    monitor = 0
    follow = mouse

    origin = bottom-center
    offset = (0, 40)

    width = 300
    height = (0, 200)
    notification_limit = 3

    corner_radius = 0
    frame_width = 2
    gap_size = 8
    frame_color = "#9fef00"

    font = Noto Sans 10
    format = "<b>%s</b>\n%b"
    line_height = 5
    markup = full
    word_wrap = yes
    alignment = center

    idle_threshold = 0
    ignore_dbusclose = false

[urgency_low]
    background = "#141d2b"
    foreground = "#838ea4"
    frame_color = "#838ea4"
    timeout = 2

[urgency_normal]
    background = "#141d2b"
    foreground = "#fbfbfb"
    frame_color = "#9fef00"
    timeout = 2

[urgency_critical]
    background = "#141d2b"
    foreground = "#fbfbfb"
    frame_color = "#ff3e3e"
    timeout = 2
EOF
```

## Kitty

### $HOME/.config/kitty/kitty.conf

> Configura el comportamiento y la apariencia del emulador de terminal `kitty`. Define aspectos como los márgenes internos, el tamaño de la fuente, los atajos de teclado y otras preferencias de funcionamiento, adaptando la terminal al flujo de trabajo y mejorando la productividad durante el uso diario.

```bash
cat > $HOME/.config/kitty/kitty.conf << 'EOF'
window_margin_width 5
single_window_margin_width 0
window_padding_width 5
single_window_padding_width 4 6

background #141d2b
foreground #a4b1cd
font_size 14

cursor #9fef00
cursor_text_color #141d2b

selection_background #9fef00
selection_foreground #141d2b

color0 #1a2433
color1 #ff3e3e
color2 #9fef00
color3 #ffaf00
color4 #0086ff
color5 #9f00ff
color6 #2ee7b6
color7 #a4b1cd

color8 #838ea4
color9 #ff3e3e
color10 #9fef00
color11 #ffaf00
color12 #0086ff
color13 #9f00ff
color14 #2ee7b6
color15 #fbfbfb

active_border_color #9fef00
inactive_border_color #838ea4

map ctrl+shift+enter new_window_with_cwd
map ctrl+shift+t new_tab_with_cwd

map ctrl+left neighboring_window left
map ctrl+right neighboring_window right
map ctrl+up neighboring_window up
map ctrl+down neighboring_window down

map f1 copy_to_buffer a
map f2 paste_from_buffer a
map f3 copy_to_buffer b
map f4 paste_from_buffer b
map f5 copy_to_buffer c
map f6 paste_from_buffer c
map f7 copy_to_buffer d
map f8 paste_from_buffer d
map f9 copy_to_buffer e
map f10 paste_from_buffer e

map ctrl+shift+z toggle_layout stack

enable_audio_bell no
EOF
```

## LightDM

### /etc/lightdm/lightdm.conf

> Configura el comportamiento del gestor de inicio de sesión `LightDM`. Define cómo se inicia la sesión gráfica, el usuario que iniciará sesión automáticamente, el entorno de escritorio que se cargará y otras opciones relacionadas con el proceso de autenticación y el inicio del sistema.

```bash
sudo tee > /etc/lightdm/lightdm.conf << 'EOF'
[LightDM]
run-directory=/run/lightdm

[Seat:*]
autologin-user=melvin
autologin-user-timeout=0
autologin-session=bspwm
greeter-setup-script=/usr/bin/numlockx on
session-wrapper=/etc/lightdm/Xsession
EOF
```

### /etc/lightdm/lightdm-gtk-greeter.conf

> Configura la apariencia y el comportamiento del greeter de `LightDM`, que es la pantalla mostrada antes de iniciar sesión. Permite personalizar aspectos como el fondo, el tema, los iconos, el cursor y los elementos visibles de la interfaz, manteniendo una apariencia consistente con el resto del entorno de escritorio.

```bash
sudo tee > /etc/lightdm/lightdm-gtk-greeter.conf << 'EOF'
[greeter]
background=#11111b
user-background=false
theme-name=catppuccin-mocha-mauve-standard+default
icon-theme-name=Papirus-Dark
cursor-theme-name=Bibata-Modern-Classic
hide-user-image=true
panel-position=top
indicators=~session;~power
EOF
```

## Polybar

### $HOME/.config/polybar/config.ini

> Configura la apariencia y el contenido de `polybar`, la barra de estado utilizada durante la sesión. Define los módulos que se muestran, su posición, tipografía, colores, espaciado y comportamiento, además de integrar scripts personalizados para mostrar información dinámica, como la dirección IP, el estado de la VPN y el objetivo actual.

```bash
cat > $HOME/.config/polybar/config.ini << 'EOF'
include-file = $HOME/.config/colors/colors.ini

[bar/main]
underline = ${colors.accent}
underline-size = 2
background = #141d2b
modules-left = arch desk ip vpn target
modules-right = dog
width = 99%
offset-x = 0.5%
offset-y = 10
padding = 1
module-margin = 1
font-0 = Adwaita-Sans:size=14;3
font-1 = Hack Nerd Font:size=14;3
font-2 = JetBrainsMono Nerd Font Mono:size=16;3
cursor-click = pointer
cursor-scroll = ns-resize

[module/arch]
type = custom/text
label = [ %{F#1793D1}%{T3}󰣇%{T-}%{F-} ]

[module/desk]
type = internal/xworkspaces
label-empty-foreground = ${colors.fg-muted}
label-active-foreground = ${colors.success}
label-occupied-foreground = ${colors.warning}

[module/ip]
label-foreground = ${colors.info}
type = custom/script
exec = $HOME/.config/polybar/scripts/ip.sh
click-left = $HOME/.config/polybar/scripts/ip.sh click
interval = 2

[module/vpn]
label-foreground = ${colors.success}
type = custom/script
exec = $HOME/.config/polybar/scripts/vpn.sh
click-left = $HOME/.config/polybar/scripts/vpn.sh click
interval = 2

[module/target]
label-foreground = ${colors.danger}
type = custom/script
exec = $HOME/.config/polybar/scripts/target.sh
click-left = $HOME/.config/polybar/scripts/target.sh click
interval = 2

[module/dog]
type = custom/text
label = [ %{F#C68642}%{T3}󰩃%{T-}%{F-} ]
EOF
```

### $HOME/.config/polybar/launch.sh

> Es un script encargado de iniciar `polybar` al comenzar la sesión gráfica. Antes de crear una nueva instancia, finaliza cualquier instancia existente para evitar duplicados, asegurando que la barra se inicie correctamente al iniciar o recargar el entorno de escritorio.

```bash
cat > $HOME/.config/polybar/launch.sh << 'EOF'
#!/bin/bash

killall -q polybar

polybar main 2>&1 | tee -a /tmp/polybar.log & disown
```

### $HOME/.config/polybar/scripts/ip.sh

> Obtiene la dirección IP de la interfaz de red principal y la muestra en `polybar`. Además, permite copiar la dirección IP al portapapeles al hacer clic sobre el módulo y muestra una notificación con el resultado.

```bash
cat > $HOME/.config/polybar/scripts/ip.sh << 'EOF'
#!/bin/bash

source $HOME/.config/colors/colors.sh

IP=$(ip a show enp0s3 2>/dev/null | grep -oP '(?<=inet\s)\d+\.\d+\.\d+\.\d+')

case "$1" in
  click)
    if [ -n "$IP" ]; then
      echo -n "$IP" | xclip -sel clip
      dunstify -r 1001 -u normal "IP copied" "$IP"
    else
      dunstify -r 1001 -u low "IP" "No connection"
    fi
    exit 0
    ;;
esac

if [ -n "$IP" ]; then
  echo "%{F$COLOR_PRIMARY}󰈀%{F-}%{O12}$IP"
else
  echo "%{F$COLOR_DARK}󰈀%{F-}%{O10}"
fi
EOF
```

### $HOME/.config/polybar/scripts/vpn.sh

> Comprueba si existe una conexión VPN activa y muestra su dirección IP en `polybar`. Además, permite copiar la dirección IP de la VPN al portapapeles al hacer clic sobre el módulo y muestra una notificación con el resultado.

```bash
cat > $HOME/.config/polybar/scripts/vpn.sh << 'EOF'
#!/bin/bash

source $HOME/.config/colors/colors.sh

IFACE=$(ip -o link show | awk -F': ' '/tun0/ {print $2}')
VPN_IP=$(ip a show tun0 2>/dev/null | grep -oP '(?<=inet\s)\d+\.\d+\.\d+\.\d+')

case "$1" in
  click)
    if [ "$IFACE" = "tun0" ]; then
      echo -n "$VPN_IP" | xclip -sel clip
      dunstify -r 1002 -u normal "VPN copied" "$VPN_IP"
    else
      dunstify -r 1002 -u low "VPN" "Disconnected"
    fi
    exit 0
    ;;
esac

if [ "$IFACE" = "tun0" ]; then
  echo "%{F$COLOR_SUCCESS}󰆧%{F-}%{O10}$VPN_IP"
else
  echo ""
fi
EOF
```

### $HOME/.config/polybar/scripts/target.sh

> Lee el objetivo almacenado en `target.txt` y lo muestra en `polybar`, permitiendo visualizar rápidamente la dirección IP o IP:puerto del objetivo actual. Además, permite copiar el objetivo al portapapeles al hacer clic sobre el módulo y muestra una notificación con el resultado.

```bash
cat > $HOME/.config/polybar/scripts/target.sh << 'EOF'
#!/bin/bash

source $HOME/.config/colors/colors.sh

ip_address=$(/bin/cat $HOME/.config/polybar/scripts/target.txt)

case "$1" in
  click)
    if [ -n "$ip_address" ]; then
      echo -n "$ip_address" | xclip -sel clip
      dunstify -r 1003 -u critical "Target copied" "$ip_address"
    else
      dunstify -r 1003 -u low "Target" "No target set"
    fi
    exit 0
    ;;
esac

if [ -n "$ip_address" ]; then
  echo "%{F$COLOR_DANGER}󰓾%{F-}%{O10}$ip_address"
else
  echo ""
fi
EOF
```

## Rofi

### $HOME/.config/rofi/keybinds.rasi

> Define la apariencia de la ventana de `rofi` utilizada para mostrar la lista de atajos de teclado. Configura aspectos como los colores, la tipografía, el tamaño, el espaciado y la disposición de los elementos.

```bash
cat > $HOME/.config/rofi/keybinds.rasi << 'EOF'
* {
    bg:    #141d2b;
    fg:    #fbfbfb;
    key:   #0086ff;
    desc:  #838ea4;
    arrow: #838ea4;

    background-color: transparent;
    text-color: @fg;
    font: "JetBrainsMono Nerd Font 11";
}

window {
    width: 675px;
    background-color: @bg;
    border: 0px;
    border-radius: 0px;
    padding: 30px;
}

mainbox {
    children: [ "message", "listview" ];
    spacing: 20px;
    background-color: transparent;
}

message {
    background-color: transparent;
    padding: 0px 0px 10px 4px;
}

textbox {
    text-color: @key;
    font: "JetBrainsMono Nerd Font Bold 18";
    background-color: transparent;
}

listview {
    lines: 12;
    scrollbar: false;
    spacing: 14px;
    background-color: transparent;
}

element {
    background-color: transparent;
    padding: 2px 4px;
}

element selected {
    background-color: transparent;
}

element-text {
    background-color: transparent;
    text-color: @fg;
    vertical-align: 0.5;
}
EOF
```

## /etc/sudoers

> Define qué usuarios y grupos pueden ejecutar comandos con privilegios administrativos mediante `sudo`, así como las condiciones bajo las cuales pueden hacerlo. En esta configuración se permite que el usuario ejecute comandos como administrador sin necesidad de introducir su contraseña.

```bash
sudo nano /etc/sudoers
```

```bash
<SNIP>
$USER ALL=(ALL:ALL) NOPASSWD: ALL
<SNIP>
```

## Theme

### $HOME/.config/gtk-3.0/settings.ini

> Configura la apariencia de las aplicaciones que utilizan `GTK 3`. Permite definir el tema visual, el tema de iconos, el cursor y otras preferencias de la interfaz.

```bash
cat > $HOME/.config/gtk-3.0/settings.ini << 'EOF'
[Settings]
gtk-theme-name=catppuccin-mocha-mauve-standard+default
gtk-icon-theme-name=Papirus-Dark
gtk-cursor-theme-name=Bibata-Modern-Classic
gtk-application-prefer-dark-theme=true
EOF
```

### $HOME/.config/gtk-4.0/settings.ini

> Configura la apariencia de las aplicaciones que utilizan `GTK 4`. Permite definir el tema visual, el tema de iconos, el cursor y otras preferencias de la interfaz.

```bash
cat > $HOME/.config/gtk-4.0/settings.ini << 'EOF'
[Settings]
gtk-theme-name=catppuccin-mocha-mauve-standard+default
gtk-icon-theme-name=Papirus-Dark
gtk-cursor-theme-name=Bibata-Modern-Classic
gtk-application-prefer-dark-theme=true
EOF
```

### $HOME/.xprofile

> Se ejecuta al iniciar una sesión gráfica y permite definir variables de entorno y comandos que deben aplicarse antes de que se inicie el entorno de escritorio. En esta configuración se establecen el tema de `GTK`, el tema y tamaño del cursor, la integración de aplicaciones `Qt` con `GTK` y se carga la configuración de `Xresources`.

```bash
cat > $HOME/.xprofile << 'EOF'
xrdb $HOME/.Xresources
export GTK_THEME=catppuccin-mocha-mauve-standard+default
export XCURSOR_THEME=Bibata-Modern-Classic
export XCURSOR_SIZE=24
export QT_QPA_PLATFORMTHEME=gtk3
EOF
```

### $HOME/.Xresources

> Define recursos para aplicaciones que utilizan el sistema de recursos de X11. Permite configurar preferencias como el tema del cursor, las fuentes, los colores y otros parámetros compatible.

```bash
cat > $HOME/.Xresources << 'EOF'
Xcursor.theme: Bibata-Modern-Classic
EOF
```

## Custom path

### /etc/profile.d/custom.sh

> Se ejecuta automáticamente al iniciar una sesión de usuario y permite definir configuraciones globales del entorno. En esta configuración se añaden directorios personalizados a la variable de entorno `PATH`, haciendo que herramientas instaladas fuera de las rutas estándar puedan ejecutarse desde cualquier ubicación sin necesidad de especificar su ruta completa.

```bash
sudo tee > /etc/profile.d/custom.sh << 'EOF'
#!/bin/bash

if [ -n "$HOME" ]; then
    export PATH="$PATH:$HOME/go/bin"
    export PATH="$PATH:$HOME/.local/share/gem/ruby/3.4.0/bin"
    export PATH="$PATH:$HOME/.local/share/pnpm"
    export PATH="$PATH:$HOME/.config/npm/global/bin"
fi
EOF
```

## Remove packages

```bash
sudo pacman -Rns rxvt-unicode xdo dmenu
```

## Docker

[Arch Wiki](https://wiki.archlinux.org/title/Docker)

```bash
sudo pacman -S docker
sudo systemctl start docker.service
sudo docker run hello-world
sudo usermod -aG docker $USER
sudo pacman -S docker-compose
```

Cerrar sesión y volver a iniciar sesión

## Firefox

> Permiten que Firefox reconozca automáticamente los dominios `.htb` y `.thm` como dominios válidos. De esta forma, es posible acceder a máquinas de `Hack The Box` y `TryHackMe` escribiendo únicamente el nombre del host en la barra de direcciones, sin necesidad de especificar el dominio completo.

- `about:config`
- `browser.fixup.domainsuffixwhitelist.htb`, `browser.fixup.domainsuffixwhitelist.thm`
- `true`

## Git

[Website](https://git-scm.com/)

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
git config --global core.autocrlf input
git config --global credential.helper store
```

## Nvchad

[Github](https://nvchad.com/docs/quickstart/install/)

```bash
nano $HOME/.local/share/nvim/lazy/NvChad/lua/nvchad/configs/cmp.lua
```

```bash
dofile(vim.g.base46_cache .. "cmp")

local cmp = require "cmp"

local options = {
  completion = { completeopt = "menu,menuone", autocomplete = false },
```

## Pacman — Cyber

```bash
sudo pacman -S bind gobuster hashcat hydra impacket metasploit nikto nmap openbsd-netcat openldap openvpn pocl proxychains-ng smbclient socat sqlmap tcpdump tor torbrowser-launcher wireshark-qt wpscan php
```

## Paru (AUR) — Cyber tools

```bash
paru -S burpsuite ffuf netexec
```

## Paru (AUR) — Misc

```bash
paru -S visual-studio-code-bin
```

## enum4linux-ng

[Github](https://github.com/cddmp/enum4linux-ng)

```bash
sudo pacman -S smbclient python-ldap3 python-yaml impacket
git clone https://github.com/cddmp/enum4linux-ng
cd enum4linux-ng
python3 -m venv venv
source venv/bin/activate
python3 -m pip install wheel
python3 -m pip install -r requirements.txt
```

## Evil-winrm

[Github](https://github.com/hackplayers/evil-winrm)

```bash
gem install evil-winrm
```

## John The Ripper

[Github](https://github.com/openwall/john)

```bash
git clone https://github.com/openwall/john.git
cd john/src
./configure && make
cd ../..
sudo mv john /opt
```

## Kerbrute

[Github](https://github.com/ropnop/kerbrute)

```bash
go install github.com/ropnop/kerbrute@latest
```

## Searchsploit

[Gitlab](https://gitlab.com/exploit-database/exploitdb)

```bash
sudo git clone https://gitlab.com/exploit-database/exploitdb.git /opt/exploit-database
sudo ln -sf /opt/exploit-database/searchsploit /usr/local/bin/searchsploit
cp -n /opt/exploit-database/.searchsploit_rc ~/
```

Modificar el archivo `$HOME/.searchsploit_rc`

```bash
# Exploits
path_array+=("/opt/exploit-database")

# Shellcodes
path_array+=("/opt/exploit-database")
```

## SecLists

[Github](https://github.com/danielmiessler/SecLists)

```bash
sudo mkdir /usr/share/wordlists
sudo git clone https://github.com/danielmiessler/SecLists.git /usr/share/wordlists/seclists
```

## Tor

[Website](https://www.torproject.org/)

```bash
sudo pacman -S tor
sudo systemctl start tor
```

## Wireshark

[Website](https://www.wireshark.org/)

```bash
sudo usermod -aG wireshark $USER
```

## Wordlists

[Github](https://github.com/insidetrust/statistically-likely-usernames)

```bash
sudo git clone https://github.com/insidetrust/statistically-likely-usernames.git /usr/share/wordlists/statistically-likely-usernames
```

## Performance

```bash
sudo systemctl disable systemd-networkd-wait-online.service
```

```bash
sudo mkdir -p /etc/systemd/journald.conf.d
sudo tee /etc/systemd/journald.conf.d/volatile.conf > /dev/null << 'EOF'
[Journal]
Storage=volatile
RuntimeMaxUse=50M
EOF
sudo systemctl restart systemd-journald
sudo rm -rf /var/log/journal
```

```bash
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swappiness.conf
sudo sysctl vm.swappiness=10
```

```bash
sudo sed -i 's/^HOOKS=(base udev autodetect microcode modconf kms keyboard keymap consolefont block filesystems fsck)$/HOOKS=(base udev autodetect microcode modconf kms block filesystems fsck)/' /etc/mkinitcpio.conf
sudo mkinitcpio -P
```

## Otras herramientas

```bash
sudo pacman -S ascii
```