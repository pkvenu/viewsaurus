# Viewsaurus by Twilio

Viewsaurus helps you create awesome code walkthroughs for your open source projects. It's like view source, but 84% more awesome.

# Authoring Tutorials with Viewsaurus

Recently I've been writing a few tutorials for
[Twilio](https://www.twilio.com/), so far it was a pleasant experience. It's
always fun to play with a nice API in the languages you like, right?

The tool we're using to write these tutorials made our work easy. I enjoyed
working with **viewsaurus**.

If you have to use this [viewsaurus](https://www.npmjs.com/package/viewsaurus),
here are the instructions to set it up.

## Assumptions

You have installed [Node.js](https://nodejs.org/en/).

## Steps
 1. Install [viewsaurus](https://www.npmjs.com/package/viewsaurus) package

   ```bash
   $ npm install viewsaurus -g
   ```
 1. Open your tutorial directory

   ```bash
   $ cd path/to/your/repo
   ```
 1. Checkout a new branch `gh-pages`, if it doesn't exist of course :wink:

   ```bash
   $ git checkout -b gh-pages
   ```
 1. Start the tutorial from scratch

   ```bash
   $ saurus new
   ```
 1. Authoring the tutorial

   ```bash
   $ saurus author
   ```
 1. Visit [http://localhost:8080](http://localhost:8080) to see the tutorial in
   action.

### Notes

* Edit `tutorial/config.json` as appropriate for the project.
* Update `tutorial/index.jade` as needed.

---

**See Also**

* [Installing Node.js](https://docs.npmjs.com/getting-started/installing-node)
* [Jade Template Engine](http://jade-lang.com/)
* [Mastering Markdown](https://guides.github.com/features/mastering-markdown/)


## License

MIT