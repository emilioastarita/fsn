## fsn FileSystem Notifier

`fsn-toucher` and `fsn-watcher` are two little binaries to propagate filesystem notification changes from one computer to another.

### Motivation

This allow you to run your build system (as webpack, grunt or gulp) in watch mode inside your VM or container (vagrant, docker) and be notified by changes.


## Server fsn-toucher inside your vagrant 

 Usually default options are ok:

```bash
$ vagrant ssh
 # inside your vagrant
$./fsn-toucher 
 fsn-toucher server listening on 0.0.0.0:9595
```
## Watcher fsn-watcher in your local computer

You must specify the ip and optionally the port where your `fsn-toucher` server is running (192.168.100.100 in this case)

```bash
$./fsn-watcher --help

  Usage: fsn-toucher [options] <watch-dir> [remote-dir]


  Options:

    -V, --version        output the version number
    -i, --ip [ip]        Toucher server ip to notify
    -p, --port [port]    Toucher server port to notify
    --ignore <patterns>  <patterns> Ignored patterns separated by ,
    -h, --help           output usage information

$./fsn-watcher --ip 192.168.100.100 ~/my-projects/fsn /var/www/fsn/

Remote toucher: 192.168.100.100:9595
Remote dir: /var/www/my-projects/fsn/
Watch dir: /home/chulo/my-projects/fsn
Ignored patterns:  /node_modules/

Trying connection: 192.168.100.100:9595
Connected:  192.168.100.100:9595
Waiting for file changes
```

Now when you locally change something inside `~/my-projects/fsn` the `fsn-toucher` server will be notified and will touch the file to change the access time. 

