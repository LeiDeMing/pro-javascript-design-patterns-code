let CompositeForm = function (id, method, action) {
    this.formComponents = [];
    this.element = document.createElement('form');
    this.element.id = id;
    this.element.method = method || 'POST';
    this.element.action = action || '#';
}

CompositeForm.prototype={
    add:function(child){
        Interface.ensureImplements(child,Composite,FormItem);
        this.formComponents.push(child);
        this.element.appendChild(child.getElement);
    },
    remove:function(child){
        for(let i=0,len=this.formComponents.length;){

        }
    }
}