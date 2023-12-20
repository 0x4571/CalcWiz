# **CalcWiz Discord Bot Documentation**

# Introduction

CalcWiz is a versatile Discord bot calculator that allows users to perform mathematical calculations, store variables, and customize settings. This documentation provides an overview of CalcWiz's features and syntax.

# Memory Management

To manage the memory in your calculator you must ping the bot at the beginning of each sentence, as shown in the examples.

**Viewing Memory**

To see the current state of the memory, use the following command:
```
@CalcWiz show (memory)
```
*Types of memory include variables and settings.*

**Setting Memory**

To set a value in memory, use the following command:
```
@CalcWiz set (memory) (name) (value)
```
*Replace (memory) with either "variables" or "settings," (name) with the name of the variable or setting, and (value) with the new value.*


# Using the calculator

CalcWiz supports simple mathematical expressions enclosed in dollar signs.

**Expression Syntax**
```
$expression$
```

**Examples**

  Addition:
    ```
    $2 + 2$
    ```

  Complex Expression:
    ```
    $3 * 9 + (2 + 1)$
    ```
    
  Trigonometric Function:
    ```
    $sin(180)$
    ```
  *Note that, by default, you must use radians for trigonometric functions. This, however, can be changed in settings.* 
