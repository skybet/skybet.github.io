require 'rspec'
require 'safe_yaml'

authors_file = SafeYAML.load_file('_data/authors.yml')
author_names = authors_file.keys

author_names.each do |key|
  author = authors_file[key]
  describe key do
    it 'should have an image' do
      expect(author).to have_key('image')
      image = author['image']
      image_path = File.join('images', 'authors', image)
      expect(File).to exist(image_path)
    end
    it 'should have a role' do
      expect(author).to have_key('role')
    end
    it 'should have a name' do
      expect(author).to have_key('name')
    end
  end
end