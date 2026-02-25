---
title: C Dilinde Bitwise (Bit Düzeyinde) Operatörler
date: 2026-02-25
description: C programlama dilindeki bitwise operatörleri örneklerle açıklıyoruz.
---

# C Dilinde Bitwise (Bit Düzeyinde) Operatörler

Bitwise operatörler, sayıların ikili (binary) gösterimleri üzerinde doğrudan işlem yapar. C dilinde performans gerektiren düşük seviyeli programlama, donanım kontrolü ve veri manipülasyonunda yaygın olarak kullanılırlar.

## Bitwise Operatörler Listesi

| Operatör | Adı | Açıklama |
|----------|-----|----------|
| `&`  | AND | Her iki bit de 1 ise sonuç 1 |
| `\|` | OR  | Bitlerden en az biri 1 ise sonuç 1 |
| `^`  | XOR | Bitler farklıysa sonuç 1 |
| `~`  | NOT | Bitleri tersine çevirir (tümleyen) |
| `<<` | Left Shift  | Bitleri sola kaydırır |
| `>>` | Right Shift | Bitleri sağa kaydırır |

---

## 1. AND (`&`)

Her iki operandın ilgili biti 1 ise sonuç 1 olur.

```c
#include <stdio.h>

int main() {
    int a = 12; // 1100 (binary)
    int b = 10; // 1010 (binary)
    printf("%d & %d = %d\n", a, b, a & b); // 1000 = 8
    return 0;
}
```

**Çıktı:** `12 & 10 = 8`

**Kullanım:** Belirli bitleri maskelemek (mask) için kullanılır. Örneğin bir sayının tek mi çift mi olduğunu kontrol etmek:

```c
if (n & 1) {
    printf("Tek sayı\n");
} else {
    printf("Çift sayı\n");
}
```

---

## 2. OR (`|`)

İki operandın ilgili bitlerinden en az biri 1 ise sonuç 1 olur.

```c
#include <stdio.h>

int main() {
    int a = 12; // 1100
    int b = 10; // 1010
    printf("%d | %d = %d\n", a, b, a | b); // 1110 = 14
    return 0;
}
```

**Çıktı:** `12 | 10 = 14`

**Kullanım:** Belirli bitleri 1 yapmak (set etmek) için kullanılır.

```c
int flags = 0b0000;
flags = flags | 0b0010; // 2. biti set et
```

---

## 3. XOR (`^`)

İki operandın ilgili bitleri farklı ise sonuç 1 olur.

```c
#include <stdio.h>

int main() {
    int a = 12; // 1100
    int b = 10; // 1010
    printf("%d ^ %d = %d\n", a, b, a ^ b); // 0110 = 6
    return 0;
}
```

**Çıktı:** `12 ^ 10 = 6`

**Kullanım:** İki değişkeni geçici değişken olmadan yer değiştirmek için kullanılabilir:

```c
int x = 5, y = 9;
x = x ^ y;
y = x ^ y;
x = x ^ y;
// Artık x = 9, y = 5
```

---

## 4. NOT (`~`)

Tüm bitleri tersine çevirir (0 → 1, 1 → 0).

```c
#include <stdio.h>

int main() {
    int a = 12; // 00001100
    printf("~%d = %d\n", a, ~a); // 11110011 = -13 (ikiye tümleyen)
    return 0;
}
```

**Çıktı:** `~12 = -13`

> **Not:** Sonuç ikiye tümleyen (two's complement) temsili nedeniyle negatif çıkar: `~n = -(n+1)`

---

## 5. Left Shift (`<<`)

Bitleri sola kaydırır; sağdan 0 ile doldurur. Her bir sola kaydırma sayıyı 2 ile çarpmaya eşdeğerdir.

```c
#include <stdio.h>

int main() {
    int a = 3;  // 0011
    printf("%d << 2 = %d\n", a, a << 2); // 1100 = 12
    return 0;
}
```

**Çıktı:** `3 << 2 = 12`

---

## 6. Right Shift (`>>`)

Bitleri sağa kaydırır. Her bir sağa kaydırma sayıyı 2'ye bölmeye eşdeğerdir.

```c
#include <stdio.h>

int main() {
    int a = 12; // 1100
    printf("%d >> 2 = %d\n", a, a >> 2); // 0011 = 3
    return 0;
}
```

**Çıktı:** `12 >> 2 = 3`

---

## Pratik Örnek: Bit Bayrakları (Bit Flags)

Bitwise operatörlerin en yaygın kullanım alanlarından biri birden fazla boolean değerini tek bir tam sayıda saklamaktır:

```c
#include <stdio.h>

#define FLAG_READ    (1 << 0)  // 0001 = 1
#define FLAG_WRITE   (1 << 1)  // 0010 = 2
#define FLAG_EXECUTE (1 << 2)  // 0100 = 4

int main() {
    int permissions = 0;

    // Okuma ve yazma iznini set et
    permissions |= FLAG_READ;
    permissions |= FLAG_WRITE;

    // Okuma iznini kontrol et
    if (permissions & FLAG_READ) {
        printf("Okuma izni var\n");
    }

    // Yazma iznini kaldır
    permissions &= ~FLAG_WRITE;

    if (!(permissions & FLAG_WRITE)) {
        printf("Yazma izni yok\n");
    }

    return 0;
}
```

**Çıktı:**
```
Okuma izni var
Yazma izni yok
```

---

## Özet

Bitwise operatörler; düşük seviyeli programlama, performans optimizasyonu ve donanımla doğrudan iletişim gibi alanlarda vazgeçilmezdir. Temel işlemleri öğrendikten sonra bu operatörlerle çok güçlü ve verimli kodlar yazabilirsiniz.
