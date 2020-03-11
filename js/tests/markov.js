//
function Markov(source, len=1) {
  const dictionary = []; // the set of all words in source
  const chain = {}; // markov chain

  let parent, previous_key;

  // first parent (appears nowhere, has only one child node - first word in the source)
  // if len>1 then there can be several 'first' parents, depending on 'len'.
  update_externals(Array(len).fill(-1), String(Array(len).fill(-1)));
  // generating chain
  for (let i = 0; i < source.length; ++i) {
    // search word in dictionary
    const dict_word = source[i];
    let dict_index = dictionary.findIndex(e => e === dict_word);
    // add word to the dictionary if cannot be found
    if (dict_index < 0) {
      dict_index = dictionary.length;
      dictionary.push(dict_word);
    }
    // create key for current node
    const key = [...previous_key.slice(1), dict_index];
    // stringify key
    const key_str = String(key);
    // search current node in parent
    const node = parent.find(e => { return e.key === key_str });
    // increase apperaring counter if founded otherwise create the node
    if (node) node.appears += 1;
    else parent.push({ key: key_str, appears: 1 });
    // set current node as parent and set current key as previous
    update_externals(key, key_str);
  }
  // count 'appears_max' for each node
  for (let key in chain) chain[key].appears_max = chain[key].reduce((a,c) => a+c.appears, 0);

  // setter of 'parent' and 'previous_key'
  function update_externals(key, key_str) {
    previous_key = key;
    if (!chain[key_str]) chain[key_str] = [];
    parent = chain[key_str];
  }

  // output.
  return { chain, dictionary, len };
}


function ExecuteMarkov({ chain, dictionary, len }, MAX=0xff) {
  // random node key
  const keys = Object.keys(chain);
  let key = keys[Math.random()*keys.length|0];
  // generate output.
  let output = '';
  for (let INF = 0; INF < MAX; ++INF) {
    const node = chain[key];
    // parse word from dictionady using key (only first subkey)
    output += dictionary[~~key.split(',')[0]]||'';
    // end of chain (node w/o childs)
    if (node.length < 1) break;
    // get new key from node's children
    let acc = Math.random()*node.appears_max|0;
    let child_index = 0;
    for (let child of node) {
      acc -= child.appears;
      if (acc < 0) break;
      ++child_index;
    }
    key = node[child_index].key;
  }
  // parse tail of the key into output
  output += key.split(',').slice(1).map(e => dictionary[~~e]||'').join('');

  // output.
  return output;
}
