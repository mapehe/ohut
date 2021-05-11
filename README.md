# `ohut` - A simple remote pair programming tool

`ohut` is a small pair programming tool that keeps two instances of a git
repo in sync in real time. Any time a file system event is recorded
a git patch is sent through a socket and applied at the receiving end. An instance of
a simple [relay server](https://github.com/three-consulting/ohut-server) is
used in communicating the patches to the receiving end.

Unlike most existing solutions, `ohut` strives to be minimal.
It's essentially just a thin layer of automation on git that leverages the
powerful existing libraries such as [socket.io](https://github.com/socketio/socket.io)
and [chokidar](https://github.com/paulmillr/chokidar) for its features and standard cryptographic
techniques for its encryption and authentication scheme.

Install `ohut` via npm:

```
npm install --global ohut
```

The project is currently at a public beta. You are encouraged to open up issues on bugs,
feature requests and **especially security**.

## Setting up

You'll need to perform three steps to use `ohut`: Initalization, adding a server and
adding at least one trusted key.

### Initialization

If this is your first time using `ohut`, you will need to initialize a configuration:

```
ohut init
```

This will, among other things generate a key pair. After initialization, you can display
your public key with `ohut key print`.

### Adding a server

`ohut` requires adding a relay server to transmit your patches:

```
ohut server add <name> <url>
```

The parameter `<name>` is simply a custom name for the server at `<url>` for later
use with `ohut watch`.

### Adding a trusted key

Patches can only be sent to and received from a client whose public key `ohut` has
been told to trust. This means you'll have to to share your public key with your
peer before using `ohut` together. Print your public key with:

```
ohut key print
```

You'll need to use some external tool to send this string to your peer. The public key
is designed to be shared, so this information can be freely communicated. The important
point is to use a channel such that your peer can trust that the key they received really
is from you.

Your peer will have to add this key to their trusted keys with the following command
in order to send and receive patches with you:

```
ohut key trust
```

The command will ask you to give a name to the key for later use with `ohut watch`.

## Usage

Having performed the setup according to the previous section, you are ready to go! Simply run the
following command at the root of any git repo:

```
ohut watch <server> [keys...]
```

The parameter `<server>` is the server name created at section `Adding a server`. The optional
parameter `[keys...]` is a list of trusted key names created with `ohut key trust`. You will send and
receive patches from clients specified by `[keys...]` that are connected to `<server>`.

For example, if Alice has added a server called `sierra` and wants to send and receive patches from Bob, whose
trusted key is called `bob`, they can run:

```
ohut watch sierra bob
```

If Alice wants to send and receive patches from both Bob and Charlie:

```
ohut watch sierra bob charlie
```

If Alice wants to send and receive patches from ALL the people whose public keys they have added:

```
ohut watch sierra --all
```

Run `ohut watch --help` for a complete list of options.

We have tried to make `ohut` easy and smooth to use, but there are some potential caveats:

- Patches are only applied if both clients share the same HEAD. If you are at
  at a different commit than your peer, you'll need to fix that in order to exchange patches.

- If Alice runs `ohut watch sierra bob` and Charlie runs `ohut watch sierra alice bob`, Alice will
  ignore Charlie's patches, because Charlie is not included in `[keys...]`.

- Alice and Bob need to be connected to the same server in order to exchange patches.

## Security

All `ohut` traffic is end-to-end encrypted and cryptographically signed. This section details the
encryption scheme.

We assume the existence of a reliable external channel for the users to share their public keys with each
other. After the keys are shared, an encrypted `ohut` patch is of the following form:

```
{
    destinationKey: string,
    senderKey: string,
    header: string,
    data: string,
    signature: string
}
```

The value `destinationKey` is used by the relay server to emit the message to the correct sockets.
The value `header` is asymmetrically encrypted using 3072 bit RSA public key `destinationKey`. The
plaintext `header` contains the symmetric key and the initalization vector which are used in encrypting
the actual patch data `data` with 256 bit AES.

The field `signature` contains a RSA-SHA512 signature of the plaintext `data` created using the private key
corresponding to `senderKey`. When the authenticity of `senderKey` is hence established, it is compared against
the keys the user has added in their trusted keys.

The keys are also used as an authentication mechanism on the relay-server. Upon connecting to the
[standard implementation](https://github.com/three-consulting/ohut-server) of the `ohut` relay server, the
client presents their public key and the server responds with random data encrypted with that key. The
client must then successfully decrypt the data in order to start receiving patches whose `destinationKey`
equals their public key or send patches whose `senderKey` equals their public key.
