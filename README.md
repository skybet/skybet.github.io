Sky Betting & Gaming Technology Site
=====================================

This is source for our public technology site at https://sbg.technology, rendered via [Jekyll](https://jekyllrb.com/docs/home/) through GitHub Pages.

## How to Contribute

1. Fork it (https://github.com/skybet/skybet.github.io/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. [Submit a Pull Request](https://help.github.com/articles/using-pull-requests/)

All changes are welcome from additional articles, to styling changes, etc. If you're not comfortable with a pull request you can email <engineering@skybettingandgaming.com> directly with your post in [Markdown format](https://help.github.com/articles/getting-started-with-writing-and-formatting-on-github/) with any accompanying pictures.

If making updates to the layout, use the sass in the `_sass/` directory. There is a gulp task which listens and compiles and also runs the output through autoprefixer, which means you don't have to manually add vendor prefixes to styles, and cleanCSS to minify. This runs as part of the jekyll build.

## Adding a New Article

To add a new article you need to add a new file in [markdown](https://guides.github.com/features/mastering-markdown/) format in the `_posts` directory following the naming conventions of the existing files. The file will need to include [Jeykll front matter](http://jekyllrb.com/docs/frontmatter/) like this:

    ---
    layout:     post
    title:      Your Title Here
    date:       2015-08-05 15:45:00
    summary:    Your summary here.
    author:     author_name
    image:      post_image.png
    category:   Category
    tags:       comma, separated, tag names
    ---

You should add any images used in the post to the `images` directory.  If the post has a main image you wish to appear on the homepage and in any post previews, you should add it with the name referenced in the frontmatter.

If the article is in a brand new category, simply run `bundle exec rake createCategory["CATEGORY NAME"]` or manually update `_data/categories.yml` and create a category file in `category/`.

If an article has been created by multiple authors, you can specify the `author` key as a list (using hyphens as the list item marker), instead:

    ---
    author:
     - author_key
     - another_author_key
    ---

If you have included a ```code``` block for a language that does not appear in the list below as part of your article, you will also need to update the client-side syntax highlighting library we use - [Prism](http://prismjs.com/) - to include rules for that language.  You can create a new bundle on the Prism website, which should include all the languages in the list, plus your new language for CSS and JS: the existing files have a link in a comment at the top which will prepopulate the checkboxes.  You should then add the language to this list.

    * Bash
    * CSS (included in core Prism download)
    * Go
    * Groovy
    * HTML (included in core Prism download)
    * Javascript (included in core Prism download)
    * Python
    * R
    * React (JSX)
    * Ruby
    * Scala
    * SQL
    * TypeScript
    * YAML


### Style Guide

* The company name should always be referred to as "Sky Betting & Gaming"
* In markdown files such as posts, you don't need to encode html entities (e.g. ampersand). In HTML, you do.
* Post headings should start at `h2` (`##`, as the post title will be the `h1`) with a properly nested hierarchy.
* Take note of formatting/capitalisation of different framework/languages (e.g. JavaScript, Node.js); we aim to be consistent with the formal documentation for that framework/language.

### Images

If you wish to use an image within the post, reference them in markdown like so:

    ![Shuffled Lego](/images/lego-shuffled.jpg)

### Videos

Videos should be hosted on the [SB&G Engineers YouTube channel](https://www.youtube.com/channel/UCKhLYGIGTBiD-9zyGkDwfDA).

### Authors

For the `author` key, if you have not posted before, you should create a corresponding entry in `_authors` folder, using the alias used in the post frontmatter as the file name, e.g. in `_authors/author_name.md`:

    name: Author Name
    image: author_name.png
    role: Author's Role / Squad
    tribe: Author's Tribe
    startDate: 01-05-2015
    bio: Some information about the author, can be as long as you like, but should be written in proper English.
    interests: Comma, Separated, Interests, List
    twitter: optional_twitter_handle
    github: optional_github_account

Again, add the author's image to the `images/authors` directory with the same filename as referenced within the author definition, and make sure it's 100x100 pixels; all author information will be included into each of the appropriate posts made by the author, as per `_includes/author.html`.

## Rendering the Site Locally

To render the site locally, first you need to `sudo gem install bundler`. Then you can `cd` into your cloned repository and run `bundle install` to install all the rubygems which Github Pages (where the site gets hosted) uses, for compatibility reasons.  The site itself is powered by [jekyll](https://jekyllrb.com), run `bundle exec rake` (which calls `jekyll serve`) which will result in the site being available on `http://127.0.0.1:4000/`, re-rendering if you make any changes.  If you have any trouble getting the gems to install (particularly within OS X's default environment), we recommend installing [rvm](https://rvm.io).

If you are making UI updates you will also need to run `npm install`, then you can then run `GULP=1 bundle exec rake` to call the gulp build with the existing set up.

### Mac setup

Docker and Docker Compose are the best way of rendering the site locally on a Mac because the version of Ruby is too old (2.1 is the minimum due to Nokogiri).  However, you can install a newer version of Ruby to run natively if you prefer.

0. `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"` to install Homebrew if you don't already have it (see https://brew.sh)
1. `brew install rbenv ruby-build` to install dependencies.  This might take a while depending on what you already have installed
2. `eval "$(rbenv init -)"` and add this to your .bash_profile or .zshrc so that rbenv is automatically loaded
3. `rbenv install 2.4.1` to actually install Ruby 2.4.1.  This will take some time to compile
4. `rbenv global 2.4.1` to make Ruby 2.4.1 the default
5. `rehash` if you are using zsh so that it knows about the new ruby binary stub
5. `ruby -v` to make sure it works
6. `gem install bundler` to install bundler

You can now follow the rest of the instructions to render the site locally.  The first time you serve the site locally you'll be asked to allow ruby to listen for network connections, you should agree to this.

### Docker setup

Many of you will be aware of `pscli` for running development tools locally via Docker.  There's an equivalent tool for working with static site generators like Jekyll called [Staticli](https://github.com/staticli/staticli).  Once you have downloaded this and have Docker installed, you can render the site locally with `staticli rake`.  There's also a similar command for running the gulp tasks `staticli gulp`.

## Validating your edits

You can run the tests to make sure that your post, category and authors changes are considered valid.  To do this run `bundle exec rake validate`.
