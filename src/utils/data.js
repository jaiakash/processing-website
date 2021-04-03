import { titleCase as _titleCase } from 'title-case';

// applies title case after replacing _ by spaces
export const titleCase = (slug) => _titleCase(slug.replace(/_/g, ' '));

//filters the references/examples based on a search text
export const filterItems = (items, searchTerm) => {
  if (searchTerm && searchTerm !== '') {
    const searchTerms = searchTerm.split(' ');
    const filtered = [];
    loop1: for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const searchString = item.childJson
        ? JSON.stringify(Object.values(item.childJson)).toLowerCase()
        : JSON.stringify(item).toLowerCase();
      loop2: for (let j = 0; j < searchTerms.length; j++) {
        // console.log(searchString, searchTerms[j]);
        if (!searchString.includes(searchTerms[j].toLowerCase())) {
          continue loop1;
        }
      }
      filtered.push(item);
    }
    return filtered;
  } else {
    return items;
  }
};

export const organizeReferenceItems = (items) => {
  const tree = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { category, subcategory } = item.childJson;

    let categoryIndex = tree.findIndex(
      (cat) => cat.slug.toLowerCase() === category.toLowerCase()
    );

    if (categoryIndex === -1) {
      tree.push({
        slug: category.toLowerCase(),
        name: titleCase(category),
        children: [],
      });
      categoryIndex = tree.length - 1;
    }

    let subcategoryIndex = tree[categoryIndex].children.findIndex(
      (subcat) => subcat.slug.toLowerCase() === subcategory.toLowerCase()
    );

    if (subcategoryIndex === -1) {
      tree[categoryIndex].children.push({
        slug: subcategory ? subcategory : '',
        name: subcategory ? titleCase(subcategory) : '',
        children: [],
      });
      subcategoryIndex = tree[categoryIndex].children.length - 1;
    }
    tree[categoryIndex].children[subcategoryIndex].children.push({
      slug: item.name,
      dir: item.relativeDirectory,
      ...item.childJson,
    });
  }

  return tree;
};

export const organizeExampleItems = (items, images) => {
  const tree = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const image = images
      ? images.find((img) => img.relativeDirectory === item.relativeDirectory)
      : '';
    const [category, subcategory, exampleName] = item.relativeDirectory.split(
      '/'
    );

    let categoryIndex = tree.findIndex((cat) => cat.name === category);

    if (categoryIndex === -1) {
      tree.push({
        name: category,
        children: [],
      });
      categoryIndex = tree.length - 1;
    }

    let subcategoryIndex = tree[categoryIndex].children.findIndex(
      (subcat) => subcat.name === subcategory
    );

    if (subcategoryIndex === -1) {
      tree[categoryIndex].children.push({
        name: subcategory ?? '',
        children: [],
      });
      subcategoryIndex = tree[categoryIndex].children.length - 1;
    }

    tree[categoryIndex].children[subcategoryIndex].children.push({
      slug: exampleName,
      name: item.childJson.name,
      image: image,
      ...item.childJSON,
    });
  }

  return tree;
};

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
