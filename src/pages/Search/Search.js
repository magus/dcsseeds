// highlight text inside search result
// e.g. <SearchResult /> that parses children string and adds element wrapping search result substring

// search results animation
// framer-motion initial random position with layout prop
// should simulate results flying in from random direction as if pulling from various sources
// unmount fly out to bottom

export default function Search() {
  return <div>Search</div>;
}

// fragment SearchResult on scrapePlayers_itemLocations {
//   item {
//     name
//   }
//   branch
//   level
//   seed {
//     version
//     value
//   }
//   morgue {
//     timestamp
//     url
//     player {
//       name
//     }
//   }
// }

// query MyQuery {
//   front: scrapePlayers_itemLocations(where: {item: {name: {_ilike: "rag%"}}}, order_by: {morgue: {timestamp: desc}, seed: {version: desc}}) {
//     ...SearchResult
//   }
//   startWord: scrapePlayers_itemLocations(where: {item: {name: {_ilike: "% rag%"}}}, order_by: {morgue: {timestamp: desc}, seed: {version: desc}}) {
//     ...SearchResult
//   }
//   middle: scrapePlayers_itemLocations(where: {item: {name: {_ilike: "%rag%"}}}, order_by: {morgue: {timestamp: desc}, seed: {version: desc}}) {
//     ...SearchResult
//   }
// }
