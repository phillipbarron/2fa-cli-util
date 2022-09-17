# Generate a login code based on a one time password key

copies current 2fa code to the clipboard



## usage

```bash
    acode [Options] 
    Options:
        -a Add key
        -k [Key name] get code for named key
        -r [Key name] Remove named key
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

### need to extract existing keys from Google auth?

[try this](https://github.com/krissrex/google-authenticator-exporter)