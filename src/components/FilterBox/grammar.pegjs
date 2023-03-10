/*
 * Grammar
 * ==========================
 *
 * Accepts expressions like: nha == nhat AND (nhat == nha or "nhat " contains "tt") OR nhat == "test"
 */

{{
/* eslint-disable */
}}

{
  const parseTrace = options.parseTrace;
}

Expression
  = _ head:Condition tail:(ws (("AND"i / "OR"i ) ws)? Condition)* sc:(ws SearchCondition)? _ {
      var result = [head]
    
      for (var i = 0; i < tail.length; i++) {
        var current = tail[i][2];
        if (!tail[i][1] || !tail[i][1][0]) {
          current.conditionType = 'and';
        }else{
          current.conditionType = tail[i][1][0];
        }
        result.push(current);
      }

      if(sc && sc[1]) {
        result.push(sc[1])
      }

      return result;
    }

SearchCondition
  = sc:Search {
    return {search: sc}
  } 

Condition
  = "(" _ expr:Expression _ ")" 
  		{   
        return {expressions: expr}; 
      }
      / ThreeFactorCondition 
  
ThreeFactorCondition
  = category:ValidName ws operator:Operator ws value:ValidValue 
  			{ 
          return {
              category : category,
              operator: operator,
              value: value
            }; 
        } 
  
Operator "operator"
  = ValidToken+ { parseTrace.pushOperator(text()); return text(); }
  

ValidValue "value"
  = ValidToken+ { parseTrace.pushValue(text() ); return text(); }  
  /"\"" name:[^\"]* "\"" {
        var value = name.join("");
        parseTrace.pushValue(value);
        return value;
      }

Search  "search"
  = ValidToken+ { return text()}

ValidName  "category"
  = ValidToken+ { parseTrace.pushCategory(text() ); return text(); }  
  /"\"" name:[^\"]* "\"" {
        var value = name.join("");
        parseTrace.pushCategory(value);
        return value;
      }

ValidToken
  = [^ \(\)\"\t\n\r]

ws "whitespace"
  = [ \t\n\r]+
  
_ "whitespace"
  = [ \t\n\r]*
