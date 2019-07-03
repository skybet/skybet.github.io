require 'rspec'
require 'date'
require 'safe_yaml'

ALL_POSTS = Dir.glob('_posts/*.md')

ALL_POSTS.each do |post|
  describe post do
    it 'should have a valid frontmatter' do
      expect { SafeYAML.load_file post }.not_to raise_error
    end

    it 'should have valid dates' do
      file_date = File.basename(post)[0..9]
      expect { Date.parse(file_date) }.not_to raise_error
      expect(Date.parse(file_date)).to be_instance_of(Date)

      # Depending on how the date is input in the front matter, yaml could parse it as either a time or a string
      markdown_date = SafeYAML.load_file(post)['date']
      if markdown_date.class == Time
        markdown_date = markdown_date.to_date
      elsif markdown_date.class == String
        markdown_date = Date.parse(markdown_date)
      end

      expect(Date.parse(file_date)).to eq markdown_date

    end

    it 'should have a valid author' do
      frontmatter = SafeYAML.load_file post
      post_authors = Array(frontmatter['author'])
      expect(post_authors.length).to be >= 1

      post_authors.each do |author|
        valid_authors = SafeYAML.load_file("_authors/#{author}.md")
        expect(valid_authors).to have_key('name')
      end
    end

    it 'should have a valid category' do
      post_category = SafeYAML.load_file(post)['category']
      valid_categories = SafeYAML.load_file('_data/categories.yml').map { |c| c['name'] }

      expect(valid_categories).to include(post_category)
    end
  end
end
