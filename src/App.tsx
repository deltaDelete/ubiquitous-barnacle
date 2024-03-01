import {Component, ComponentState, useEffect, useState} from 'react';
import {useForm, SubmitHandler} from "react-hook-form";
import './App.css';
import './index.css';
import {Simulate} from "react-dom/test-utils";
import load = Simulate.load;

interface City {
    cityId: number,
    name: string
}

function App() {
    const [cities, setCities] = useState<City[]>([])
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: {errors},
    } = useForm<City>()

    const onSubmit: SubmitHandler<City> = (data) => {

        fetch("/api/city", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(result => result.ok ? result.json() : undefined)
            .then(data => {
                setCities([...cities, data]);
            })
    }

    useEffect(() => {
        fetch("api/city")
            .then(result => result.ok ? result.json() : [])
            .then(data => {
                setCities(data as City[]);
            })
    }, [])

    const onRemove = (self: CityItem, item: City) => {
        fetch(`/api/city/${item.cityId}`, {
            method: "DELETE"
        }).then(result => {
            if (result.ok) {
                const index = cities.indexOf(item);
                delete cities[index];
                setCities([...cities]);
            }
        })
    }
    
    const onEdit = (self: CityItem, item: City) => {
        // TODO
    }

    return (
        <div className="flex flex-col gap-2">
            <div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                    <input defaultValue="" {...register("name")}
                           className="text-black border-black border-2 rounded-md p-2" type="text"/>
                    <input type="submit" className="p-2 bg-orange-400 rounded-md hover:bg-slate-700 hover:text-white"/>
                </form>
            </div>
            <div className="card">
                <div className="flex flex-col gap-1">
                    {cities.map((c) => c && <CityItem city={c} onRemoveCallback={onRemove} onEditCallback={onEdit}/>)}
                </div>
            </div>
        </div>
    )
}

type CityItemProps = {
    city: City,
    onRemoveCallback: ((self: CityItem, item: City) => void) | undefined,
    onEditCallback: ((self: CityItem, item: City) => void) | undefined
}

class CityItem extends Component<CityItemProps, ComponentState> {
    render() {
        return (
            <div key={this.props.city.cityId}
                 className='group/item h-[4rem] w-[16rem] flex flex-col content-center items-center justify-center p-2 rounded-md bg-slate-700 text-white text-center'>
                <span className="group-hover/item:hidden">{this.props.city.name}</span>
                <div className="group/actions hidden group-hover/item:flex items-center flex-row gap-2">
                    <span>Id: {this.props.city.cityId}</span>
                    <button onClick={() => this.removeSelf(this.props.city)} className="bg-slate-900 text-white hover:bg-red-900">DELETE</button>
                    <button onClick={() => this.editSelf(this.props.city)} className="bg-slate-900 text-white hover:bg-sky-900">EDIT</button>
                </div>
            </div>
        )
    }

    removeSelf(item) {
        this.props.onRemoveCallback?.call(null, this, item);
    }
    
    editSelf(item) {
        this.props.onEditCallback?.call(null, this, item)
    }
}

export default App
