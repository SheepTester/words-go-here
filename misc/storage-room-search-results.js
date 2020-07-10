// Shamelessly stolen from
// https://github.com/Nichodon/tech_guy/blob/master/cocnept-designs/v2/directory.js
// Too lazy to convert to 2 space indent, so I made it 5-space for no reason but
// to intentionally make it uglier

/**
 * Represents a DOM element in the directory.
 */
class DirectoryItem {
     constructor(onClick) {
          this._onClick = this._onClick.bind(this)

          this.onClick = onClick;
          this._parent = null;
          this._makeElements();
     }

     _makeElements() {
          let result = document.createElement('li');
          result.className = 'result'
          result.addEventListener('click', this._onClick)

          let name = document.createElement('span')
          name.className = 'chest-name minecraft-white'

          let id = document.createElement('span')
          id.className = 'chest-items minecraft-gray'

          result.append(name, '\n', id)

          this._elems = {
               wrapper: result,
               name,
               id,
          };
     }

     get wrapper() {
          return this._elems.wrapper;
     }

     _onClick() {
          if (this.onClick) {
               this.onClick(this);
          }
     }

     setStudent(regex, item, selected=false) {
         let {wrapper: result,name, id: idElem} = this._elems;
         if (this.student !== item) {
             this.student = item;
             const { readable, id, texture, available } = item

             if (available) {
               result.classList.remove('unavailable')
             } else {
               result.classList.add('unavailable')
             }
             result.style.backgroundImage = `url("${texture}")`
             name.innerHTML = readable.replace(regex, '<span class="matched minecraft-green">$&</span>')
             idElem.innerHTML = id.replace(regex, '<span class="matched minecraft-green">$&</span>')
         }
         this.setSelected(selected);
         return this;
     }

     setSelected(selected) {
          if (selected) {
               this._elems.wrapper.classList.add('selected');
          } else {
               this._elems.wrapper.classList.remove('selected');
          }
          return this;
     }

     setFocused(focused) {
          if (focused) {
               this._elems.wrapper.classList.add('focused');
          } else {
               this._elems.wrapper.classList.remove('focused');
          }
          return this;
     }

     // Note: Pass null to remove.
     addTo(parent=null) {
          if (parent !== this._parent) {
               if (this._parent) {
                    this._parent.removeChild(this._elems.wrapper);
               }
               this._parent = parent;
               if (parent) {
                    parent.appendChild(this._elems.wrapper);
               }
          }
          return this;
     }

     remove() {
          this.addTo(null);
          // Force update the element so it regenerates based on new filter
          this.student = null
          return this;
     }
}

// TODO: Get this dynamically?
// Visual height of each item in pixels
const ITEM_HEIGHT = 50;

// Extra items to have ready to show above and below (both sides, so additional
// items is double the constant) the list so the items seem to come in an instant.
const ITEM_PADDING = 2;

/**
 * Recycles DirectoryItems as the user scrolls to limit the number of elements.
 */
class Directory {
     constructor(wrapper) {
       this.updateScroll = this.updateScroll.bind(this)
       this._onItemClicked = this._onItemClicked.bind(this)

          this.wrapper = wrapper;

          // These need to be set
          this.filter = ''
          this.students = [];

          this.focusIndex = null
          // The student object of the selected item (NOT a DirectoryItem)
          this.selected = new Set();
          // Maps y values/a unique Symbol (if not shown) to a DirectoryItem
          this._items = new Map();

          // A dummy element to set the scroll height
          this._heightSetter = document.createElement('li');
          this._heightSetter.className = 'height-setter';
          wrapper.appendChild(this._heightSetter);

          wrapper.addEventListener('scroll', this.updateScroll);
     }

     _onItemClicked(item) {
          if (this.selected.has(item.student)) {
               item.setSelected(false);
               this.selected.delete(item.student);
          } else {

               item.setSelected(true);
               this.selected.add(item.student);
          }
          if (this.onSelect) {
               this.onSelect(this.selected);
          }
     }

     changeFocus (newFocusIndex) {
       if (this.focusIndex === newFocusIndex) return
       if (this.focusIndex !== null) {
          let selectedItem = this._items.get(this.focusIndex);
          if (selectedItem) {
            // What you're witnessing here is a 5 + 2 + 3 + 4 space indent
              selectedItem.setFocused(false);
          }
      }
      if (newFocusIndex !== null) {
        let newSelectedItem = this._items.get(newFocusIndex);
        if (newSelectedItem) {
            newSelectedItem.setFocused(true);
        }
      }
       this.focusIndex = newFocusIndex
       return this
     }

     selectFocus () {
       if (this.focusIndex !== null) {
         const selectedItem = this._items.get(this.focusIndex);
         if (selectedItem) {
           this._onItemClicked(selectedItem)
         } else {
           const item = this.students[this.focusIndex]
           if (this.selected.has(item)) {
                this.selected.delete(item);
           } else {
                this.selected.add(item);
           }
           if (this.onSelect) {
                this.onSelect(this.selected);
           }
         }
       }
       return this
     }

     // Deletes all DirectoryItems
     _deleteItems() {
          for (let item of this._items.values()) {
               item.remove();
          }
          this._items.clear();
     }

     // Simply removes all visible DirectoryItems from the list
     _hideItems() {
          for (let [y, item] of this._items) {
               if (typeof y === 'number') {
                    this._items.delete(y);
                    this._items.set(Symbol(), item);

                    item.remove();
                    item.wrapper.classList.remove('selected');
               }
          }
     }

     _generateItems() {
          // Imagine that the visible list
          const itemCount = Math.ceil(this.height / ITEM_HEIGHT) + 1 + ITEM_PADDING * 2;
          for (let i = 0; i < itemCount; i++) {
               // Symbol() just means that it hasn't been assigned a y-value
               this._items.set(Symbol(), new DirectoryItem(this._onItemClicked));
          }
     }

     updateScroll() {
          let scrollY = this.wrapper.scrollTop;
          let start = Math.floor(scrollY / ITEM_HEIGHT) - ITEM_PADDING;
          let stop = Math.ceil((scrollY + this.height) / ITEM_HEIGHT) + ITEM_PADDING;
          // An array containing items that are no longer visible
          // This also removes them from this._items
          let recycleables = [...this._items]
               .filter(([y]) => {
                    if (typeof y !== 'number' || y < start || y >= stop) {
                         this._items.delete(y);
                         return true;
                    }
                    return false;
               })
               .map(pair => pair[1]);
          for (let y = start; y < stop; y++) {
               // Do not show DirectoryItems that are out of bounds
               if (y < 0 || y >= this.students.length) continue;
               // If an item is already at this position, leave it.
               if (this._items.has(y)) continue;

               // Move a recycleable to the unclaimed position
               let recycleable = recycleables.pop();
               recycleable
                    .setStudent(this.filter, this.students[y], this.selected.has(this.students[y]))
                    .setFocused(this.focusIndex === y)
                    .addTo(this.wrapper)
                    .wrapper.style.top = y * ITEM_HEIGHT + 'px';
               this._items.set(y, recycleable);
          }
          // Hide the rest
          for (let recycleable of recycleables) {
               recycleable.remove();
               this._items.set(Symbol(), recycleable);
          }
          this.scrollY = scrollY
          return this;
     }

     async resize(then=Promise.resolve()) {
          let {height} = this.wrapper.getBoundingClientRect();
          await then;
          this.height = height;
          this._deleteItems();
          this._generateItems();
          return this;
     }

     // Call this when `this.students` is changed. Will not call updateScroll.
     updateData() {
          this._heightSetter.style.height = this.students.length * ITEM_HEIGHT + 'px';
          this._hideItems();
          this.changeFocus(null)
     }
}

export {
  ITEM_HEIGHT,
     Directory
};
