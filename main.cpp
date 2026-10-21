
#include <iostream>
#include <fstream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <cctype>
#include <algorithm>
using namespace std;

const unordered_set<string> keywords = {
    "int", "float", "double", "char", "void", "bool",
    "if", "else", "for", "while", "do", "switch",
    "case", "break", "continue", "return", "class",
    "struct", "public", "private", "static", "const",
    "long", "short", "unsigned", "signed", "using",
    "namespace", "include", "true", "false", "string",
    "auto", "new", "delete", "try", "catch", "throw"
};

const unordered_set<string> types = {
    "int", "float", "double", "char", "void", "bool",
    "long", "short", "string", "auto"
};

const unordered_set<string> controlWords = {
    "if", "else", "for", "while", "do", "switch",
    "case", "catch"
};

const unordered_set<string> operators = {
    "+", "-", "*", "/", "%", "=", "==", "!=",
    "<", ">", "<=", ">=", "++", "--", "+=", "-=",
    "*=", "/=", "&&", "||", "!", "&", "|", "^",
    "~", "<<", ">>", "->", "::", "?"
};

int main(int argc, char* argv[]) {
    string filename = argc > 1 ? argv[1] : "sample.cpp";
    ifstream file(filename);

    if (!file) {
        cout << "Error: Cannot open " << filename << '\n';
        return 1;
    }

    string source, line;
    int totalLines = 0, codeLines = 0, commentLines = 0;
    bool inBlockComment = false;

    while (getline(file, line)) {
        totalLines++;
        source += line + '\n';

        string trimmed = line;
        trimmed.erase(trimmed.begin(),
            find_if(trimmed.begin(), trimmed.end(),
                [](unsigned char c) { return !isspace(c); }));

        if (trimmed.empty()) continue;

        if (inBlockComment || trimmed.rfind("/*", 0) == 0 ||
            trimmed.rfind("//", 0) == 0) {
            commentLines++;
        } else {
            codeLines++;
        }

        size_t open = line.find("/*");
        size_t close = line.find("*/");
        if (open != string::npos &&
            (close == string::npos || close < open))
            inBlockComment = true;
        if (inBlockComment && close != string::npos)
            inBlockComment = false;
    }

    int keywordCount = 0, identifierCount = 0;
    int operatorCount = 0, operandCount = 0;
    int functionCount = 0, decisionCount = 0;
    int maxNesting = 0, nesting = 0;
    int syntaxErrors = 0;
    int singleLineComments = 0, blockComments = 0;

    unordered_map<string, int> symbols;
    vector<char> brackets;
    string previous;
    bool inString = false, inChar = false;
    bool escape = false, lineComment = false, blockComment = false;
    bool lineHasComment = false;
    string token;

    auto processToken = [&](const string& t) {
        if (t.empty()) return;

        if (keywords.count(t)) {
            keywordCount++;
            if (controlWords.count(t))
                decisionCount++;
        } else if (isalpha((unsigned char)t[0]) || t[0] == '_') {
            identifierCount++;
            symbols[t]++;
        } else if (isdigit((unsigned char)t[0])) {
            operandCount++;
        }

        token.clear();
    };

    for (size_t i = 0; i < source.size(); i++) {
        char c = source[i];
        char next = (i + 1 < source.size()) ? source[i + 1] : '\0';

        if (lineComment) {
            if (c == '\n') {
                lineComment = false;
                if (lineHasComment) singleLineComments++;
                lineHasComment = false;
            }
            continue;
        }

        if (blockComment) {
            if (c == '*' && next == '/') {
                blockComment = false;
                blockComments++;
                i++;
            }
            continue;
        }

        if (inString || inChar) {
            if (escape) {
                escape = false;
                continue;
            }
            if (c == '\\') {
                escape = true;
                continue;
            }
            if (inString && c == '"') inString = false;
            else if (inChar && c == '\'') inChar = false;
            continue;
        }

        if (c == '/' && next == '/') {
            processToken(token);
            lineComment = true;
            lineHasComment = true;
            i++;
            continue;
        }
        if (c == '/' && next == '*') {
            processToken(token);
            blockComment = true;
            lineHasComment = true;
            i++;
            continue;
        }
        if (c == '"') {
            processToken(token);
            inString = true;
            operandCount++;
            continue;
        }
        if (c == '\'') {
            processToken(token);
            inChar = true;
            operandCount++;
            continue;
        }

        if (isalnum((unsigned char)c) || c == '_') {
            token += c;
            continue;
        }

        processToken(token);

        if (c == '(' || c == '[' || c == '{') {
            brackets.push_back(c);
            nesting++;
            maxNesting = max(maxNesting, nesting);
        }

        if (c == ')' || c == ']' || c == '}') {
            char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (brackets.empty() || brackets.back() != expected) {
                syntaxErrors++;
            } else {
                brackets.pop_back();
                nesting--;
            }
        }

        string op(1, c);
        if (i + 1 < source.size()) {
            string two = op + next;
            if (operators.count(two)) {
                op = two;
                i++;
            }
        }

        if (operators.count(op)) {
            operatorCount++;
            if (op == "&&" || op == "||" || op == "?")
                decisionCount++;
        }

        // Count simple function definitions.
        if (c == '(' && !previous.empty() &&
            !keywords.count(previous))
            functionCount++;

        if (!isspace((unsigned char)c) &&
            c != '(' && c != ')' && c != '{' && c != '}' &&
            c != '[' && c != ']' && c != ';' && c != ',' &&
            c != '.')
            previous = string(1, c);
    }

    processToken(token);
    syntaxErrors += (int)brackets.size();

    cout << "\n====================================\n";
    cout << "   SOURCE CODE METRICS ANALYZER\n";
    cout << "====================================\n";
    cout << "Input file             : " << filename << '\n';
    cout << "Total lines            : " << totalLines << '\n';
    cout << "Non-empty code lines   : " << codeLines << '\n';
    cout << "Comment lines          : " << commentLines << '\n';
    cout << "Keywords               : " << keywordCount << '\n';
    cout << "Identifier occurrences : " << identifierCount << '\n';
    cout << "Unique identifiers     : " << symbols.size() << '\n';
    cout << "Operators              : " << operatorCount << '\n';
    cout << "Operands               : " << operandCount << '\n';
    cout << "Function-like calls    : " << functionCount << '\n';
    cout << "Decision points        : " << decisionCount << '\n';
    cout << "Max delimiter nesting  : " << maxNesting << '\n';
    cout << "Delimiter errors       : " << syntaxErrors << '\n';

    cout << "\n--- SYMBOL TABLE ---\n";
    cout << "Identifier\tOccurrences\n";
    for (const auto& entry : symbols)
        cout << entry.first << "\t\t" << entry.second << '\n';

    cout << "\nCyclomatic complexity estimate: "
         << decisionCount + 1 << '\n';

    if (syntaxErrors == 0)
        cout << "Delimiter check: PASS\n";
    else
        cout << "Delimiter check: FAIL\n";

    cout << "====================================\n";
    return 0;
}
