Sky Betting & Gaming Engineering Site
=====================================

This is source for our public engineering site at http://engineering.skybettingandgaming.com, rendered via Jeykll through Github Pages.

### How to Contribute

1. Fork it (https://github.com/skybet/skybet.github.io/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. [Submit a Pull Request](https://help.github.com/articles/using-pull-requests/)

All changes are welcome from additional articles, to styling changes, etc. If you're not comfortable with a pull request you can email Rob Tuley directly with your post in markdown format with any accompanying pictures.

If making updates to the layout, use the sass in the `_scss/` directory.

### Adding a New Article

To add a new article you need to add a new file in markdown format in the `_posts` directory following the naming conventions of the existing files. The file will need to include [Jeykll front matter](http://jekyllrb.com/docs/frontmatter/) like this:

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

If you wish to use an image within the post, reference them in markdown like so:

    ![Shuffled Lego](/images/lego-shuffled.jpg)

For the `author` key, if you have not posted before, you should create a corresponding entry in `_data/authors.yml`, using the alias used in the post frontmatter as the key, eg.

    author_name:
        name: Author Name
        image: author_name.png
        role: Author's Role / Squad
        tribe: Author's Tribe
        startDate: 01-05-2015
        bio: Some information about the author, can be as long as you like, but should be written in proper English.
        interests: Comma, Separated, Interests, List
        twitter: optional_twitter_handle
        github: optional_github_account

Again, add the author's image to the `images` directory with the same filename as referenced within the author definition: all author information will be included into each of the appropriate posts made by the author, as per `_includes/author.html`.

### Rendering the Site Locally

To render the site locally you need to `cd` into your cloned repository and run `bundle install` to install jekyll and jekyll-feed.  You can then run `rake` (which calls `jekyll serve`) which will result in the site being available on `http://127.0.0.1:4000/`, re-rendering if you make any changes.

### Style Guide

* The company name should always be referred to as "Sky Betting & Gaming": in markdown files such as posts, you don't need to encode the ampersand.  In HTML, you do.
