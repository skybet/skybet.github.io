require 'rspec'
require 'date'
require 'safe_yaml'

categories_file = SafeYAML.load_file('_data/categories.yml')

categories_file.each do |category|
  describe category do
    it 'should have a valid category file' do
      category_file_name = File.join('category', "#{category['slug']}.md")
      expect(File).to exist(category_file_name)
      category_file = SafeYAML.load_file(category_file_name)
      expect(category_file.keys).to eq(%w(layout title category permalink))
      expect(category_file['layout']).to eq('category')
      expect(category_file['title']).to eq(category['name'])
      expect(category_file['category']).to eq(category['name'])
      expect(category_file['permalink']).to eq("/category/#{category['slug']}/")
    end
  end
end