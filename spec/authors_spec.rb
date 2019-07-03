require 'rspec'
require 'date'
require 'safe_yaml'

Dir.glob('_authors/*.md') do |author_file|
  author = SafeYAML.load_file(author_file)
  describe author_file do
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
