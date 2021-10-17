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
