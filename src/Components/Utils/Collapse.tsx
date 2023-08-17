import React from "react";

interface MyProps {
    children: any,
    triggerClass?: string,
    CollapseClass: string,
    toggleClass: string,
    collapsed?: boolean,
}

interface MyState {
    newChildren: any;
}


class Collapse extends React.Component<MyProps, MyState> {
    constructor(props) {
        super(props);

        this.collapsed = props.collapsed ?? true;

        this.state = {
            newChildren: this.genNewChild()
        };
    }

    collapsed: boolean = false;
    collapses: React.MutableRefObject<any>[] = [];

    toggleCollapse = () => {
        this.collapses.forEach(collapse => {
            let newClassName = collapse.current.className
            this.props.toggleClass.split(" ").forEach(className => {
                newClassName = newClassName.replace(className, "")
            })

            newClassName = (newClassName + " " + (this.collapsed ? this.props.toggleClass : "")).replace(/\s+/g, ' ').trim()
            collapse.current.className = newClassName
        })

        this.collapsed = !this.collapsed
    }

    componentDidUpdate(prevProps: Readonly<MyProps>) {
        if (prevProps.collapsed !== this.props.collapsed && this.props.collapsed !== undefined) {
            this.collapsed = this.props.collapsed
            this.toggleCollapse()
        }

        if (prevProps.CollapseClass !== this.props.CollapseClass ||
            prevProps.children !== this.props.children ||
            prevProps.toggleClass !== this.props.toggleClass)
            this.setState({
                ...this.state, newChildren: this.genNewChild()
            })

    }

    genNewChild = () => {
        this.collapses = [];
        return React.Children.toArray(this.props.children).map((child: any) => {
            if (this.props?.triggerClass && child.props?.className?.split(" ").includes(this.props?.triggerClass))
                return React.cloneElement(child, { onClick: () => this.toggleCollapse() })
            if (child.props?.className?.split(" ").includes(this.props.CollapseClass)) {
                const elementRef = React.createRef();
                let component = React.cloneElement(child, { ref: elementRef })
                this.collapses.push(elementRef)
                return component
            }

            else return child
        })
    }
    render() {

        return (
            <>
                {this.state.newChildren}
            </>
        )
    }
}

export default Collapse