export default class DebouncedArray<A> {
  previousUpdate: number;

  data: A[] = [];

  debounceRate: number;

  constructor(data: A[], debounceRate: number) {
    this.data = data;
    this.previousUpdate = Date.now();
    this.debounceRate = debounceRate;
  }

  push = (entry: A) => {
    if (Date.now() - this.previousUpdate > this.debounceRate) {
      this.data.push(entry);
      this.previousUpdate = Date.now();
    }
  };

  flush = () => {
    this.data = [];
    this.previousUpdate = Date.now();
  };
}
