QUnit.test("LinkedList", function(assert) {
    var ll = new PF.LinkedList();
    assert.equal(ll.length, 0, "length should be 0.");

    var node = new PF.LinkedListNode();

    ll.appendNode(node);
    assert.equal(ll.length, 1, "length should be 1.");
    assert.equal(ll.contains(node), true, "ll contains the node.");

    ll.fetchHead();
    assert.equal(ll.length, 0, "length should be 0, after fetch the head.");

});
