# Contributing to StackStudio

StackStudio is under active development.  If you'd like to contribute, here's how you can help.
These instructions are not perfect, please let us know if you find anything wrong or incomplete.


## How to report issues & request enhancements

We only accept issues that are bug reports or feature requests. Please ask questions or submit comments in the [forum](https://groups.google.com/d/forum/stackstudio).

If you've discovered a bug, feel free to submit directly to [github](https://github.com/TranscendComputing/stackstudio/issues).

## Contribution Guidelines

### Pull requests are welcome

- Please submit pull requests against the latest `dev` branch for simple merging
- Please keep commits isolated to a single issue

### Discuss your design on the mailing list

We recommend discussing your plans on the [mailing
list](https://groups.google.com/d/forum/stackstudio)
before starting to code - especially for more ambitious contributions.
This gives other contributors a chance to point you in the right
direction, give feedback on your design, and maybe point out if someone
else is working on the same thing.

### Conventions

Fork the repo and make changes on your fork in a feature branch:

- If it's a bugfix branch, name it 123-name-of-fix where 123 is the number of the
  issue
- If it's a feature branch, create an enhancement issue to announce your
  intentions, and name it 123-something where 123 is the number of the enhancement.

### Key branches

- `master` is the latest production-ready version.
- `dev` is the bleeding-edge version in progress

## Decision process

### How are decisions made?

Short answer: with pull requests to the StackStudio github repository.

All decisions can be expressed as changes to the repository. An implementation change is a change to the source code. An API change is a change to
the API specification. A philosophy change is a change to the philosophy manifesto. And so on.

All decisions affecting StackStudio, big and small, follow the same 3 steps:

* Step 1: Open a pull request. Anyone can do this.

* Step 2: Discuss the pull request. Anyone can do this.

* Step 3: Accept or refuse a pull request. The relevant maintainer does this (see below "Who decides what?")


### Who decides what?

So all decisions are pull requests, and the relevant maintainer makes the decision by accepting or refusing the pull request.
But how do we identify the relevant maintainer for a given pull request?

StackStudio follows the timeless, highly efficient and totally unfair system known as [Benevolent dictator for life](http://en.wikipedia.org/wiki/Benevolent_Dictator_for_Life),
with yours truly, John Gardner, in the role of BDFL.
This means that all decisions are made by default by me. Since making every decision myself would be highly unscalable, in practice decisions are spread across multiple maintainers.

The relevant maintainer for a pull request is assigned in 3 steps:

* Step 1: Determine the service affected by the pull request. It might be a core change, as change to Compute or AutoScale, etc.

* Step 2: Find the MAINTAINERS file which affects this directory. If the directory itself does not have a MAINTAINERS file, work your way up the the repo hierarchy until you find one.

* Step 3: The first maintainer listed is the primary maintainer. The pull request is assigned to him. He may assign it to other listed maintainers, at his discretion.


### I'm a maintainer, should I make pull requests too?

Primary maintainers are not required to create pull requests when changing their own subdirectory, but secondary maintainers are.

### Who assigns maintainers?

For the moment, John Gardner.

### How can I become a maintainer?

* Step 1: learn the module or service inside out
* Step 2: make yourself useful by contributing code, bugfixes, support etc.

<!--- * Step 3: volunteer on the irc channel (#StackStudio@freenode) --->

Don't forget: being a maintainer is a time investment. Make sure you will have time to make yourself available.
You don't have to be a maintainer to make a difference on the project!

### What are a maintainer's responsibility?

It is every maintainer's responsibility to:

* 1) Expose a clear roadmap for improving their component.
* 2) Deliver prompt feedback and decisions on pull requests.
* 3) Be available to anyone with questions, bug reports, criticism etc. on their component. This includes github requests and the mailing list.
* 4) Make sure their component respects the philosophy, design and roadmap of the overall system.

### How is this process changed?

Just like everything else: by making a pull request :)

## License

By contributing your code, you agree to license your contribution under the terms of the APLv2: https://github.com/TranscendComputing/StackStudio/blob/master/LICENSE.md
