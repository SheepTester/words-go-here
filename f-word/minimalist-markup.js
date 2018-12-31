const urlRegex = /\bhttps?:\/\/([\-A-Za-z0-9+@#\/%?=~_|!:,.;]|&amp;)*[\-A-Za-z0-9#\/=_]/g;
const startsWithProtocolRegex = /^https?:\/\//;
function minimalMarkupToHTML(markup, fakeLinks) {
  let html = '', nextIsEscaped = false, insideBrackets = false,
  bracketsJustEnded = 0, link = false, linkContent, tempHTML, lastBracketPos = 0;
  for (let i = 0; i < markup.length; i++) {
    if (bracketsJustEnded >= 2 || bracketsJustEnded && !insideBrackets && markup[i] !== '{') {
      if (markup[i] === '{') {
        nextIsEscaped = true;
      }
      bracketsJustEnded = 0;
      if (link) {
        link = false;
        if (startsWithProtocolRegex.test(html)) tempHTML += fakeLinks ? `<span class="fake-link">${linkContent}</span>` : `<a href="${html}" rel="noopener noreferrer" target="_blank">${linkContent}</a>`;
        else tempHTML += linkContent;
      } else {
        tempHTML += `<em>${html}</em>`;
      }
      html = tempHTML;
      lastBracketPos = html.length;
    }
    switch (markup[i]) {
      case '\\':
        if (nextIsEscaped) {
          html += '\\';
          nextIsEscaped = false;
        } else {
          nextIsEscaped = true;
        }
        break;
      case '{':
        if (nextIsEscaped || insideBrackets) html += '{';
        else {
          if (bracketsJustEnded) {
            link = true;
            linkContent = html;
          } else {
            tempHTML = html.slice(0, lastBracketPos) + html.slice(lastBracketPos).replace(urlRegex, fakeLinks ? `<span class="fake-link">$&</span>` : '<a href="$&" rel="noopener noreferrer" target="_blank">$&</a>');
          }
          html = '';
          insideBrackets = true;
        }
        break;
      case '}':
        if (!insideBrackets || nextIsEscaped) html += '}';
        else {
          insideBrackets = false;
          bracketsJustEnded++;
        }
        break;
      case '<': html += '&lt;'; break;
      case '>': html += '&gt;'; break;
      case '&': html += '&amp;'; break;
      case '"': html += '&quot;'; break;
      default: html += markup[i];
    }
    if (nextIsEscaped && markup[i] !== '\\')
      nextIsEscaped = false;
  }
  if (insideBrackets || bracketsJustEnded) {
    if (link) {
      if (startsWithProtocolRegex.test(html)) tempHTML += fakeLinks ? `<span class="fake-link">${linkContent}</span>` : `<a href="${html}" rel="noopener noreferrer" target="_blank">${linkContent}</a>`;
      else tempHTML += linkContent;
    } else {
      tempHTML += `<em>${html}</em>`;
    }
    html = tempHTML;
  } else {
    html = html.slice(0, lastBracketPos) + html.slice(lastBracketPos).replace(urlRegex, '<a href="$&" rel="noopener noreferrer" target="_blank">$&</a>');
  }
  return html;
}
