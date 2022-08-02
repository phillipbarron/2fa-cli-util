# Generate a login code based on a one time password key

copies current 2fa code to the clipboard



## usage

```bash
    acode [Options] 
    Options:
        -a Add Key
        -k [Key Name] get code for named key
        -r [Key Name] Remove named key
```

* install globally

```bash
 yarn global add 2fa-cli-util
```

or

```bash
npm i -g 2fa-cli-util
```

run from terminal (this should now be available system-wide)

```bash
acode
```

### todo

* allow fetching / synchronisation of keys from secret manager or similar
