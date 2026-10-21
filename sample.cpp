
#include <iostream>
using namespace std;

int add(int a, int b) {
    if (a > 0) {
        return a + b;
    }
    return b;
}

int main() {
    int x = 10;
    int y = 20;
    cout << add(x, y);
    return 0;
}
