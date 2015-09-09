Skybet Engineering Site
=======================

This is source for our public engineering site at http://engineering.skybettingandgaming.com rendered via Jeykll through Github Pages.

### How to Contribute

Preferred method is to fork the repository, make your changes and then [submit a pull request](https://help.github.com/articles/using-pull-requests/). All changes are welcome from additional articles, to styling changes, etc. 

Alternatively if you're not comfortable with a pull request you can email Rob Tuley directly with your post in markdown format with any accompanying pictures.

### Rendering the Site Locally

To render the site locally you need to [install Jekyll](https://jekyllrb.com/docs/installation/). Then `cd` into your cloned repository and run `jeykll serve` which will result in the site being available on `http://127.0.0.1:4000/`, rerednering if you make any changes.

### Adding a new Article

To add a new article you need to add a new file in markdown format in the `_posts` directory following the naming conventions of the existing files. The file will need to include Jeykll frontmatter, an example is:

    ---
    layout:     post
    title:      Your Title Here
    permalink:  your-relevant-url-slug-here
    date:       2015-08-05 15:45:00
    summary:    Your summary here.
    ---

You can add any required images to the `images` directory, and reference them in markdown like so:

    ![Shuffled Lego](/images/lego-shuffled.jpg)
    