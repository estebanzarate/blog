---
type: post
title: Linux Privilege Escalation
description: Enumeración de un sistema Linux después de obtener acceso no autorizado, diversas técnicas de escalada de privilegios 
lang: es
draft: false
---

- [LinEnum](https://github.com/rebootuser/LinEnum)
- [LinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS)

```bash
cat /etc/os-release
```

```bash
echo $PATH
```

```bash
env
```

```bash
uname -a
```

```bash
lscpu
```

```bash
cat /etc/shells
```

- Exec Shield
- iptables
- AppArmor
- SELinux
- Fail2ban
- Snort
- Uncomplicated Firewall (ufw)

```bash
lsblk
```

```bash
cat /etc/fstab
```

```bash
route
```

```bash
cat /etc/resolv.conf
```

```bash
arp -a
```

```bash
cat /etc/passwd
```

```bash
getent group sudo
```

```bash
ls /home
```

```bash
df -h
```

```bash
find / -type f -name ".*" -exec ls -l {} \; 2>/dev/null
```

```bash
find / -type d -name ".*" -ls 2>/dev/null
```

```bash
ls -l /tmp /var/tmp /dev/shm
```