module PF {
    export class LinkedList {
        public length: number = 0;
        public head: LinkedListNode;
        public tail: LinkedListNode;

        constructor() {
            length = 0;
            this.head = this.tail = null;
        }

        appendNode(node: LinkedListNode): void {
            if (this.head == null) {
                this.head = this.tail = node;
            } else {
                this.tail.next = node;
                node.prev = this.tail;
                this.tail = node;
            }
            this.length++;
        }

        insertBeforeNode(before_node: LinkedListNode, new_node: LinkedListNode): void {
            if (before_node == this.head) {
                new_node.next = this.head;
                this.head.prev = new_node;
                new_node.prev = null;
                this.head = new_node;

            } else {
                before_node.prev.next = new_node;
                new_node.prev = before_node.prev;

                before_node.prev = new_node;
                new_node.next = before_node;
            }

            ++this.length;
        }

        removeNode(node: LinkedListNode): void {
            if (node == this.head) {
                this.head = node.next;
                if (this.head != null) this.head.prev = null;
            } else {
                node.prev.next = node.next;
            }

            if (node == this.tail) {
                this.tail = node.prev;
                if (this.tail != null) this.tail.next = null;
            } else {
                node.next.prev = node.prev;
            }

            node.prev = null;
            node.next = null;

            --this.length;
        }

        fetchHead(): LinkedListNode {
            if (this.length > 0) {
                var node: LinkedListNode = this.head;
                this.head = node.next;
                if (this.head != null) this.head.prev = null;

                node.prev = null;
                node.next = null;
                --this.length;
                return node;
            }
            return null;
        }

        pop(): LinkedListNode {
            if (this.length > 0) {
                var node: LinkedListNode = this.tail;
                this.tail = node.prev;
                if (this.tail != null) this.tail.next = null;

                node.prev = null;
                node.next = null;
                --this.length;
                return node;
            }
            return null;
        }

        unshift(node: LinkedListNode): void {
            this.insertBeforeNode(this.head, node);
        }

        fetchRandom(): LinkedListNode {
            if (this.length > 0) {
                var node: LinkedListNode = this.head;
                var shifts: number = Math.round((this.length - 1) * Math.random());
                while (shifts > 0) {
                    node = node.next;
                    shifts--;
                }
                this.removeNode(node);
                return node;
            }
            return null;
        }

        removeAllNodes(): void {
            while (this.length > 0) this.removeNode(this.head);
        }

        contains(node: LinkedListNode): Boolean {
            var it: LinkedListNode = this.head;
            while (it) {
                if (it == node) return true;
                else it = it.next;
            }
            return false;
        }
    }

    export class LinkedListNode {
        next: LinkedListNode;
        prev: LinkedListNode;
        constructor() {
            this.next = this.prev = null;
        }
    }
}
