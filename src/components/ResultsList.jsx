import React from "react";
import "./ResultsList.css";

/*const ResultsList = ({ results, searched }) => {
   if (searched && results.length === 0) {
     return <p>No results found.</p>;
   }

   return (
     <ul>
       {results.map((result, index) => (
         <li key={index}>
           <h3>
             <a href={result.url} target="_blank" rel="noopener noreferrer">
               {result.title}
             </a>
           </h3>
           <p>{result.snippet}</p>
         </li>
       ))}
     </ul>
   );
 };*/





 const ResultsList = ({ results, searched }) => {
  if (searched && results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <ul>
      {results.map((result, index) => (
        <li key={index} className="search-result">
          <h3>{result.title}</h3>
          <p>{result.snippet}</p>
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            {result.url}
          </a>
        </li>
      ))}
    </ul>
  );
};







export default ResultsList;






