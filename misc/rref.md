# Gauss's algorithm

> Let us say that addition is a cheap operation. Multiplication is expensive
> operation. So we want to bound the number of multiplications in Gauss's
> algorithm. So how many multiplications do we have? Let us for simplicity
> assume that the number of variables is equal to the number of equations. So we
> have a square coefficient matrix. Now, you remember what we do. You look at
> the first column, we find some non-zero entry. We move it to the first
> position, or maybe the first position is already non-zero. And then you kill
> this variable in all other rows. So you subtract from the second row, the
> first row multiplied by some number. How many multiplications do you do? _n_.
> This next row. Again, _n_ multiplications in total. In order to kill all these
> entries, you do this many multiplications. After that, you kill these entries,
> and again, you do this many multiplications. So total you consider this sum.
> And it is approximately equal to n^3. Well, approximately equal; it's n^3 / 6,
> but as an order of magnitude, n^3. So complexity of Gauss's algorithm is n^3.
> You have to do n^3 operations, multiplications.
>
> Now, in modern problems, you have a huge number of equations and huge
> number of variables. Gauss's algorithm is hopelessly inefficient.

My Math 18 Professor Zelmanov has a characteristic way of row reducing matrices
to echelon form. I would like to thus make a row reducer that mimics his
entertaining personality while showing the steps.

## Algorithm summary

> Here we have two, here we have five, one. I would like to have one in this
> position. Therefore, I interchange the first row and the third row. I get
> this matrix.
>
> Then I want to kill this five and this two. So I subtract from the second row
> the first row multiplied by five. I get this row.
>
> And I subtract from this third row the first row multiplied by two in order to
> kill this two. I got this row.
>
> Again, I want to interchange them. Do I need to explain why? Because it is
> easier to kill 27 with the help of nine than to kill nine with the help of 27.
>
> Then I kill this 27; I just subtract from the third row the second row
> multiplied by three. I got this.
>
> I divide the second row by nine; I get this.
>
> Then, I add to the first row the second row multiplied by five. I want to kill
> this negative five. So I got zero.
>
> What do I get here? Four minus—oo...ooh? [doubts math, class checks] So it is,
> right? Okay, you see? I'm relieved. And this row is the same, and I drop
> this row because it is not informative any longer.

When I see a matrix, this is what I will do:

1. If there's a row that starts with 1, especially if the top row starts with a
   0, I will swap the row with the first row.

2. If the first row's first number isn't 1, I will multiply the row to make it
   one. This technically isn't necessary, but humans work better like this.

3. For the rest of the rows, I will multiply the first row by the respective
   row's first number but opposite (so 2 -> -2), then add that to the respective
   row.

4. The first column should be all good for reduced row echelon form.

5. The second row's leading entry should be in the second column.

   - If not, then there might be some other row below it with a non-zero entry
     in the second column.
   - There might be a free variable in the second column. If so, carry on to the
     third column.
   - If not, then there's a row with a leading entry. Of course, prefer the row
     that starts with 1. Swap it with the second row.

6. Kill the other numbers in the column.

7. Repeat for the rest of the columns.

8. Either I have reached the last row or column. If I have only reached the last
   row, the rest of the columns are free variables. We're done. If I reached the
   last column, then presumably I'll have to kill the other variables in the
   column before finishing.

9. Also, if there is a zero row, it can be dropped.

So I suppose here is a generalized form of the algorithm.

1. For each column:

   1. Let _r_ be the row under the rightmost leading entry excavated so far. If
      this is the first iteration, that'll be the first row. If there is no such row, we're done!

   2. Find a more suitable row for _r_ in _r_ and all the rows below _r_
      according to these conditions:

      1. The entry in the column may not be zero.
      2. If the entry in the column is 1, then it is the most suitable.
      3. Otherwise, take any non-zero entry. Note: Zelmenov prefered 9 over 27,
         but I am not sure if I should try to mimic that here.
      4. If all the available entries are zero, continue to the next column.

   3. Swap that row with the current row in _r_. This might be a no-op if the
      current row is already suitable.

   4. Kill the entries that are easier to kill in the other rows. This can all
      be done in a single step. For each of the other rows _i_, let _c_ be equal
      to -_a_\__i_ / _a_\__r_, where _a_\__i_ is the entry in row _i_ and
      _a_\__r_ is the entry in row _r_ in the column. If _c_ is an integer,
      multiply row _r_ by _c_ and add it to row _i_.

      - As a separate step, forget about any new zero rows.

   5. If the leading entry in _r_ is not 1, divide row _r_ by the leading entry.

   6. Repeat step 4, but without the integer constraint. This should thus kill
      all the other entries in the column.

## Dialogue

> ### Manipulations
>
> 1. add to some equation another equation, multiplied by a number,
> 2. interchange two equations,
> 3. multiply an equation by a nonzero number.

> **The main idea**: identify a variable in an equation and "kill" these
> variables in all other equations.

### Lecture 1

```
1	1	-2	0
0	1	-8	0
1	1	1	1
```

So I identify in the first equation, x_1. And that explains why I wanted to
interchange the first two equations because the first one does not have x_1, and
I wanted to have x_1. So I identify this variable and then kill this variable in
all other equations. How do we do it? Okay. You want to kill x_1 in the second
equation. What do you need to do? Nothing. There is no x_1 in the second
equation.

So let's move on to the third equation. It has x_1, and we don't want it to have
x_1. So what do you do? You subtract the first equation, just multiplied by one.
You subtract the first equation. What do you get? Okay. Can you subtract the
first equation from the third equation? x_1 disappears, x_2 disappears. What
happens to x_3? 1 + 2, 3. What happens to the right-hand sides? So on. So you
have got this system. You have to agree is as it is better than the first
system.

And you can easily write solution. x_3 is equal to 1/3. Then you go back. x_2 is
equal to 8 x_3, so 8/3. x_1 is equal to -x_2 + 2 x_3, -2.

```
1	-4	3	5
2	-7	2	3
3	-8	4	9
```

You see this 2 x_1. We want to kill it. What do you do? You have to subtract the first
equation, multiplied by 2, right? So let's do it.

First of all, you write an augmented matrix. You all understand why this is an
augmented matrix, right? In order to kill this two, you have to subtract from
the second row the first row multiplied by 2. And simultaneously, I want to kill
this 3 x_1, so I want to kill this 3. And for that, I will subtract the first
row multiplied by what? 3. So let us do it.

So here we get 0 because we know we subtract from the second row the first row
multiplied by 2. We get 0. What do we get here? -7 + 8. You all understand why
+8? You multiply -4 by 2, then you subtract it. So you get 1. By the way, the
first row goes without changes. You use it to kill other rows, but you don't
change the first row. It's a killing instrument. Okay, what do you get here? 2 -
6\. So -4. By the way, you should check my computations; I could easily make a
mistake. I should, some give, some bonus to people who catch my mistakes. So 1,
-4. What do you write here? -7: 3 - 10. So we all understood the second line,
right? This second row. The third row, you subtract the first row multiplied by
3\. So here you get 0. What do you get here? -8 + 12. 4. You understand why +
12? Here, 4 - 9: -5. 9 - 15: -6. Now, second step. After you have killed all
this, x_1 everywhere, forget about the first equation, and about x_1. It has
done its job. Now for some time. You should leave it in peace. Look at the
second equation and identify a variable.

So you see is this 1. I want to kill x_2 here. What do I do for that? I subtract
from the third row the second row multiplied by 4. Or if you wish, from the
third equation here, I subtract the second equation multiplied by 4. So now the
first equation is kept. The second equation is here. What do I get here? 0
because I killed this 4. What do I get here? -5 + 16. You understand why + 16?
So 11. -6 +, multiplication tables, + 28. -6 plus 28 is 22. You have got this
matrix. It is triangular.

### Lecture 2

```
1	1	-2	0
0	1	-8	0
3	2	2	3
```

This is the augmented matrix. You start with this variable x_1, or equivalently
this coefficient 1. And you want to kill this 3. You know, we kill x_1 in all
other equations. In the second equation, you don't need to kill it. It is not
there. But in the third, you need. So how do you kill this 3? You have to
subtract from this third row the first row multiplied by 3. Let us do it. The
first row is unchanged. The second role is unchanged. Now you kill this 3. What
do you write here? So you multiply the first row by 3. So that's 3 and subtract
it from this, from this third row, you get -1. You multiply -2 by 3: -6.
Subtract it from 2, you get 8. Here, you get 3. Okay, we are happy, we killed
x_1 in this equation. And after that, forget about the first row. Forget about
the first row and about first column.

Look at the second row. You see here 1. It corresponds to x_2. You want to kill
x_2 in all equations that are down, that are below this equation. Well, you have
to kill it here. You have to kill this -1. How do you kill -1? With the help of
this one. You have to add this second row to the third row. So do it.

You'll get 0 here, you get 0 here. What do you have here? 3, because if you add
0 to 3 you still get 3. And you have this interesting matrix.

```
1	1	-2	0
0	1	-8	0
3	2	2	0
```

First, I kill this 3. Then I kill, well, this -1. And I end up with this matrix.
Are you still on board? Okay. Now I write the systems. This matrix corresponds
to this system. This is the last row is— I can just drop it. It does not carry
any information.

```
1	3	5	7
3	5	7	9
5	7	9	1
```

So the algorithm. When I said before, we identify some variable, it's a bit
imprecise. Now I will try to be more precise. Look at the first column. Identify
a non-zero entry, a simpler one. You know, for example, 1 is preferable to 3 or
to 5, just to make computations easier. So you see this one, okay? It will be
our leading entry. We will kill this 3 and this 5. And if the first column were
0, forget about it. Look at the second column. So you see 1. Let us kill 3. How
do we kill 3? You subtract from the second row the first row multiplied by 3. We
will also want to kill 5. How do we kill five? We subtract from the third row,
the first row multiplied by 5. Let us do it. You see this -3, -5. So here we
have 0. What do we have here? 3 \* 3 is 9, 5 - 9 is negative 4. 5 \* 3 is 15. 7
\- 15, -8. 7 \* 3 is 21. 9 - 21 is -12. Any questions about the second row? So
that's how I get this row. And I will— With this, 1 \* 5 is 5. 5 - 5 is 0, so I
kill it. 3 \* 5 is 15, 7 - 15, -8. 5 \* 5, 25. 9 - 25 is -16. 7 \* 5 is 35. 1 -
35 is -34. I've got this matrix.

Now the first column is ideal. I'm happy with it. So let's forget about the
first row and first column and move on to this smaller matrix. In this column
you have two negative numbers, -4 and -8. Which one is better? Of course,
negative four. And it is clear how to kill this -8. I have to subtract from the
third row the second row multiplied by 2. You see? Okay. This is killed. -8 \* 2
is -16. This is also 0. -12 \* 2 is -24, -34 + 24 is -10. Questions about this
matrix? By the way, it is an echelon form. Because look, leading entries move to
the right. All entries below are zero. Be happy.

But I want to improve it further. For example, I want to red—. This is an
echelon form but not reduced echelon form. I want to reduce it. I want to reduce
it further. And I'm not satisfied that we have -4, -10, so let us divide the
second row by -4 because I want to have 1 here. You see? Questions about the
second row?

Another condition said that other entries in pivotal columns should be equal to
0\. For example, instead of this 3, we should have 0. And instead of this 7 and
3, we also should have zeros. So this matrix is not reduced. How do I reduce it?
Okay. I kill this 3 and this 7. I subtract from the second row the third row
multiplied by 3. And I subtract from the first row the third row multiplied by
7\. I killed this 3 and this 7. In this matrix, for example, I want to kill this
3, I'm unhappy with this 3. I subtract from the first— Let us move from left to
right. So I subtract from the first row the second row multiplied by 3 in order
to kill this 3. So I get 0 here. 2 \* 3 is 6. 5 - 6, -1. 3 \* 3, 9. 7 - 9, -2.
The second and the third row so far are intact. Questions? Do you understand how
I got this matrix and why I wanted to get it? I look at this matrix. It is not
reduced. [...] And then I kill all entries above the leading entries. Moving
from left to right, starting with this 3, I subtract from the first row the
second row multiplied by 3. Why? In order to kill this 3. So I get 0, -1, and
-2. This, I did not do anything with the second row and the third row. You
understand how I got this matrix? [...] In order to make it reduced, I have to
kill all entries above the leading ones. I start the murder from this 3. 3 \* 3
is 9. 7 - 9 is -2.

So is this matrix in reduced? No because of this -2 and this 3. They stand in
the pivotal column. I have to kill them. In order to do that, I subtract from
the second row the third row multiplied by 3. And in order to kill this -2, I
subtract from the first row the third row— Nah, I don't subtract, I add to the
first row the third row multiplied by 2. So I've got this matrix. This is in
reduced echelon form.

### Lecture 3

```
1	-2	7	-6
0	1	-6	5
```

So it is in the row echelon form. But not in the reduced one. Why not in the
reduced one? Because of this -2. You remember in the reduced echelon form, all
entries in the pivotal column except the leading entry have to be equal to 0.
Here the pivotal columns are the first column and the second column. In the
second column, -2 is not 0. We have to kill it. And for that we add to the first
row the second row multiplied by 2. That's what we get. And this is a matrix in
the reduced echelon form.

```
4	-2	7	-5
8	-3	10	-3
```

This as an augmented matrix. Look at the first column. Is it zero?. No, it is
non-zero. It contains four and eight. Are you happy with the order? Yeah, I'm
happy. Four is smaller and it is the upper position. What do you need to do to
kill this eight? You need to subtract from the second equation, the second row,
the first row multiplied by two. Let us do it. Zero, one, negative four. Then
you multiply by two, negative ten, subtract. So minus three plus ten, seven. We
have got this matrix. It is in the echelon form, but not reduced echelon form.

For example, I don't like the fact that here we have negative two, not zero, and
four is also not equal to one. So to kill this negative two, we add to the first
row the second row multiplied by two. The second row is unchanged. The first row
becomes this. I give you time to do computations. For each time when you catch a
mistake in my computations, you'll get some bonus. Okay?

Now, this matrix is still not in reduced form. You have to divide the first row
by four. So we divide. Now with this reduced form [...]

```
1	2	1	1
3	4	5	1
5	6	9	2
```

Okay, reduce it to echelon form. So you look at the—. Well, kill three, kill
this three and kill this five. Actually, we already had this equation. Okay, you
subtract from the second row the first row multiplied by three. You get this
row. Then you subtract from the third equation—er, third row—the first row
multiplied by five. Why by five? To kill this five. You have got this.

You will see this row are very nice. Negative two, two; negative four, four.
This is double of this. So I want to subtract from the third row the second row
multiplied by two. I got this.

I don't go further. Each time when in the matrix of coefficients you have zeros,
but on the right hand side, you have a non-zero number. You stop computations.
And you say that the system is inconsistent.

### Lecture 4

```
1	2	1	1
3	4	5	1
5	6	9	2
```

Then you reduce it to an echelon form. You know, you kill the three. You
subtract from the second row the first row multiplied by three. You subtract
from the third row the first row multiplied by five. I hope that by now you
understand why three and why five. I want to kill these two numbers. So I do it,
and I get this matrix.

And then I have irresistible temptation to subtract from the third row the
second row multiplied by two. You understand why? To get zeros. But here, I get
not zero. Well, I get one. The system is inconsistent [...]

```
1	-2	1	b_1
0	2	-8	b_2
5	0	5	b_3
```

So we write augmentation matrix. As always, we want to kill this five. For that,
you subtract from the third row the first row multiplied by five. So the first
two rows are unchanged, and the third row becomes this. Clear? Okay.

Then you forget about the first row, and you want to kill this ten. For that,
you subtract from the third row the second row multiplied by five. You've got
this matrix.

At this point, you can already say that the system is consistent, and that it
has a unique solution. You don't even need to— If you wish, you can continue and
bringing it to reduced echelon form, but it's not necessary.

```
1	0	2	b_1
2	1	3	b_2
1	2	0	b_3
```

You write the augmented matrix. I hope you don't have questions how to do it.
Because by this moment, you are supposed to know it. Okay. Then as always, you
see we have only one algorithm in this course. Gauss's algorithm. And it is used
non-stop. That's why I did not want to save time on Gauss's algorithm. This is
most important part of the course. Okay.

So in order to kill this two, you subtract from the second row the first row
multiplied by two. And in order to kill this one, you subtract from the third
row the first row. You have got this matrix.

Do you follow? Then, you know, I want, you know, it's tempting. I subtract from
the third row the second row multiplied by two to kill this, and I do kill it.
So did you all follow up to this matrix? Questions about the way I got this
matrix are welcome.

### Lecture 5

```
2	-1	1	0
5	2	-1	0
1	-5	4	0
```

You write the matrix. You ignore the zeros because what would be the point of
writing it? So this is the matrix of this system. Here we have two, here we have
five, one. I would like to have one in this position. Therefore, I interchange
the first row and the third row. I get this matrix.

Then I want to kill this five and this two. So I subtract from the second row
the first row multiplied by five. I get this row. And I subtract from this third
row the first row multiplied by two in order to kill this two. I got this row.

Again, I want to interchange them. Do I need to explain why? Because it is
easier to kill twenty-seven with the help of nine than to kill nine with the
help of twenty-seven. Then I kill this twenty-seven; I just subtract from the
third row the second row multiplied by thre. I got this.

I have this zero row. I could forget about it, but I still keep it, but I didn't
have to. Okay. I divided the second— Well, at this point, you already can say
that there are infinitely many non-zero solutions. Why? The pivotal column— Even
at this point you can say it. The pivotal columns are the first one and the
second one. Because pivot columns are the columns that contain leading entries.
In the first row, the leading entry is one. In the second row, the leading entry
is nine. So the pivotal columns are the first column and the second column. And
basic variables x one and x two. x three is a free variable, so there are infinitely
many non-zero solutions, but I will finish this example. I divide the second row
by nine. I get this.

Then I add to the first row the second row multiplied by five. I want to kill
this negative five. So I got zero. What do I get here? Four minus twenty-eight
divided by nine. Four times nine is thirty-six, Thirty-six minus— [...] Okay,
I'm not sure that it is one over nine, I hope. [...] No. It's a question— It
boils down to the question whether we all remember multiplication table. Four
minus twenty-eight divided by nine, thirty-six minus twenty-eight, eight over
nine. So I think it's not one over nine. [...] So it is, right? [...] Okay, you
see, I'm relieved. And this row is the same, and I dropped this row because it
is not informative any longer.

```
1	2	-1	1	1
2	-1	1	-1	1
1	7	-4	4	2
3	1	0	0	2
```

So in any case, we write the augmented matrix and do what we did many times. We
reduce it to reduced form. You subtract from the second row the first row
multiplied by two. You subtract from the third row the first row. You subtract
from the fourth row the first row multiplied by three. Any questions about this
matrix?

Now, you add to the third row the second row to kill this five. You subtract
from the fourth row the second row.

Luckily you got two zero rows. Then I just throw them away. I don't need to copy
them again and again. It's not informative. I forgot about them. Only two rows
remain. Okay. Then I killed— It's still, you know, leading entries are equal to
one, that is fine, but it's not reduced because here we have two, not zero. In
order to kill this two, I subtract from the first row the second row multiplied
by two.

Now I can hope only that I did not make arithmetical mistakes here. And this is
the reduced form.

### Lecture 6

```
1	2	-1	1	1
2	-1	1	-1	1
1	7	-4	4	2
3	1	0	0	2
```

You write the augmented matrix. You reduce it to echelon form. Any questions
about how to reduce echelon form? This is an absolute must. On your exam, both
on the midterm exam, on the final exam, there will be something related to
reduction of matrices to echelon form because that was the only, the main
algorithm that we went over. So you reduce— This is the echelon form, not
reduced echelon.

In order to reduce it, you have to subtract from the first row the second row
multiplied by two in order to kill this two. That's what you get.

### Lecture 7

```
1	1	1	b_1
3	0	6	b_2
-1	1	-3	b_3
```

Well, hopefully by now you know what to do. You subtract from the second row the
first row multiplied by three. You add to the third row the first row. You get
this.

You divide the second row by three. You divide the third row by two. You get
this.

You subtract from the third row the second row, you'll get this.

Now, if you had problems reducing a matrix the echelon form, it's time to get
very worried. If you don't understand this algorithm, we will see to it that
there is no way to pass the exam.

```
1	1	1	1
0	2	-1	3
3	1	4	0
```

You have this matrix. Reduce. I don't know to which extent I have to explain
again and again how do we reduce? It will be easier if you see some strange
step, immediately ask. It may happen that it was my mistake. And then I will
give you some bonus for catching it. Okay. So you see zero row. Discard it,
throw it away. Divide the second row by two.

Subtract the second row from the first row. And this matrix is in reduced
echelon form.

### Lecture 8

```
1	2	-1	b_1
0	1	1	b_2
2	1	-5	b_3
```

Well, we bring it to an echelon form. We subtract from the third row the first
row multiplied by two. We get this.

Then I add it to the third row the second row multiplied by three. I got this.
