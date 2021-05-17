# `ohut` - A simple git-based remote pair programming tool

`ohut` is a small proof-of-concept pair programming tool that keeps the files of two (or more)
instances of a git repo in sync in real time. Any time a file system event is recorded a git
patch is sent through a simple [relay server](https://github.com/three-consulting/ohut-server)
and applied a the receiving end. All `ohut` traffic is end-to-end encrypted and signed.

The need for this kind of a tool arose during the pandemic: All work went remote and whenever we
needed to collaborate on something in real-time, it usually either ended up to sharing the screen through
a video call, leaving the others unable to actively work on the code, or or to using special (huge)
editor plugins which never seemed to really work.

However, if we just introduce a thin layer of automation on git, we can keep the files in sync
in real time. This enables, for example, collaborating with your peer(s) over an audio-only call so
that you instantly see each others changes in your favorite editors. The hard problems are already
solved by existing technologies such as git, [socket.io](https://github.com/socketio/socket.io) and
[chokidar](https://github.com/paulmillr/chokidar).

`ohut` works exclusively with the staging area of git so it will not mess up your commit history. It
tries to combine the local and remote changes hunk by hunk with as little destruction as possible.

Install `ohut` via npm:

```
npm install --global ohut
```

The tool is currently at a proof-of-concept stage. You are encouraged to open up issues on bugs,
feature requests and security.

## Setting up

You'll need to perform three steps to use `ohut`: Initalization, adding a server and
adding at least one trusted key.

### Initialization

If this is your first time using `ohut`, you will need to initialize a configuration:

```
ohut init
```

This will, among other things generate a key pair that `ohut` will use. After initialization,
you can display your public key with `ohut key print`. This public key acts as your digital
identity when using `ohut`. It will be used to sign anything you send to your peers to prove
that the data really is from you.

### Adding a server

`ohut` requires adding a relay server to transmit your patches:

```
ohut server add <name> <url>
```

The parameter `<name>` is simply a custom name for the server at `<url>` for later
use with `ohut watch`.

If you want to use the public relay server hosted by Three Point Consulting at `https://ohut.three.consulting`:

```
ohut server add tpc https://ohut.three.consulting
```

If you want to host your own instance instead, the setup should be trivial.

### Adding a trusted key

Patches can only be sent to and received from a trusted user: A client whose public key `ohut`
has been told to trust. This means you'll have to to share your public key with your
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

The command will prompt for a name for the key for later use with `ohut watch`.

## Usage

Having performed the setup according to the previous section, you are ready to go! Simply run the
following command at the root of any git repo:

```
ohut watch <server> [keys...]
```

The parameter `<server>` is the server name created at section `Adding a server`. The optional
parameter `[keys...]` is a list of trusted key names created with `ohut key trust`. You will send and
receive patches from clients specified by `[keys...]` that are connected to `<server>`.

When you and peer both connect to the same server, you will negotiate a shared secret which will be used
in encrypting your traffic. When this happens, `ohut` will log

```
Conected to [peer].
```

and you are ready to work together! When you receive patches, you'll notice `ohut` logging things.

For example, if Alice has added a server called `tpc` and wants to send and receive patches from Bob, whose
trusted key is called `bob`, they can run:

```
ohut watch tpc bob
```

If Alice wants to send and receive patches from both Bob and Charlie:

```
ohut watch tpc bob charlie
```

If Alice wants to send and receive patches from ALL the people whose public keys they have added:

```
ohut watch tpc --all
```

Run `ohut watch --help` for a complete list of options.

We have tried to make `ohut` easy and smooth to use, but there are some potential caveats:

- Patches are only applied if both clients share the same HEAD. If you are at
  at a different commit than your peer, you'll need to fix that in order to exchange patches.

- If Alice runs `ohut watch tpc bob` and Charlie runs `ohut watch tpc alice bob`, Alice will
  ignore Charlie's patches, because Charlie is not included in `[keys...]`.

- Alice and Bob need to be connected to the same server in order to exchange patches.

- `ohut` knows when a session is established, but it doesn't know when a session is disconnected.
  If Alice and Bob run `ohut watch` and Bob disconnects, Alice will not be notified.

## Security

Standard cryptographic methods are used to authenticate and encrypt all `ohut` traffic.
First and foremost, the encryption scheme strives to achieve a reasonable level of security
even when `ohut` is used with a third-party server. Setting up an `ohut` server is a trivial
task, however, and, if security is a priority, you are highly encouraged to self-host and limit
access to the instance on the network-layer level.

When `ohut init` is executed, an RSA key pair is generated. This key pair acts as a digital
identity for the user which their peer must explicitly whitelist by running `ohut key trust`.
There is no built in way in `ohut` for a user to share their public key, forcing them to use
an independent, hopefully reliable, channel for sharing their public key with their peer.

Since the public keys have been shared _before_ any peer to peer communication occurs through
`ohut`, it's straightforward to prove the origin and destination of any peer-to-peer message
with RSA signatures. All `ohut` peer-to-peer messages contain the receiver public key signed
into the message, which proves both the identity of the sender and the identity of the intended
receiver.

When two users with mutual trust use `ohut watch` together, a standard ephemeral Diffie-Hellman
key exchange is performed (since this is peer-to-peer communication everything gets signed as
described above). This establishes a shared session secret. The shared session secret is then
used with a publicly agreed upon salt to generate a 256 bit symmetric key with PBKDF2. AES is
then used to symmetrically encrypt all patches between the users.

A server is considered not trusted, because it may be run by a third party. However, a honest
public server adds some difficulty for other clients to intercept the encrypted pathces and
send false messages. Client's public key is required on connect and the client must solve a
challenge to prove that they actually control the key: The server sends random encrypted data
to the client and the client responds with a hash of the decrypted value (this scheme is similar
to what was used for public key authentication in
[SSH-1](https://docstore.mik.ua/orelly/networking_2ndEd/ssh/ch03_04.htm#ch03-83508.html)). When
client has proven that they hold a public key they are only able to send messages with their
key as the sender and receive messages with their key as the receiver.
