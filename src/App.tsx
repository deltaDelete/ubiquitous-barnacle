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
    const [isEdit, setIsEdit] = useState(false)

    const [selectedIndex, setSelectedIndex] = useState(0)

    const {
        register,
        handleSubmit,
        watch,
        formState: {errors},
        setValue
    } = useForm<City>()

    const onSubmit: SubmitHandler<City> = (data) => {

        if (isEdit) {
            fetch(`/api/city/${data.cityId}`, {
                method: "PUT",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(result => result.ok ? result.json() : undefined)
                .then(data => {
                    cities[selectedIndex] = data;
                    setCities(cities);
                });
            return;
        }
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
                delete cities[self.props.index];
                setCities([...cities]);
            }
        })
    }

    const onEdit = (self: CityItem, item: City) => {
        setValue("name", item.name);
        setValue("cityId", item.cityId);
        setSelectedIndex(self.props.index);
        setIsEdit(true);
    }

    const cancel = () => {
        setValue("cityId", 0);
        setValue("name", "");
        setSelectedIndex(0);
        setIsEdit(false);
    }

    return (
        <div className="flex flex-col gap-2">
            <div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                    <input type="hidden" {...register("cityId")} />
                    <input defaultValue="" {...register("name", {required: true, minLength: 5})}
                           aria-invalid={errors.name ? "true" : "false"}
                           className="text-black aria-invalid:border-red-500 border-black border-2 rounded-md p-2" type="text"/>
                    <input value={isEdit ? "Изменить" : "Добавить"} type="submit"
                           aria-disabled={typeof errors != typeof {}}
                           className="p-2 bg-orange-400 aria-disabled:bg-gray-600 rounded-md hover:bg-slate-700 hover:text-white"/>
                    {errors.name ? <p>{errors.name.type}</p> : <p></p>}
                    <button type="button" className={isEdit ? "static" : "hidden"} onClick={cancel}>Отмена</button>
                </form>
            </div>
            <div className="card">
                <div className="flex flex-col gap-1 max-h-[16rem] overflow-x-clip overflow-y-scroll">
                    {cities.map((c, index) => c &&
                        <CityItem city={c} index={index} onRemoveCallback={onRemove} onEditCallback={onEdit}/>)}
                </div>
            </div>
        </div>
    )
}

type CityItemProps = {
    city: City,
    index: number,
    onRemoveCallback: ((self: CityItem, item: City) => void) | undefined,
    onEditCallback: ((self: CityItem, item: City) => void) | undefined
}

class CityItem extends Component<CityItemProps, ComponentState> {
    render() {
        return (
            <div key={this.props.city.cityId}
                 className='group/item relative h-[4rem] w-[16rem] flex flex-col content-center items-center justify-center p-2 rounded-md bg-slate-700 text-white text-center'>
                <span className="group-hover/item:invisible absolute">{this.props.city.name}</span>
                <div
                    className="group/actions invisible relative group-hover/item:flex group-hover/item:visible items-center flex-row gap-2">
                    <span>Id: {this.props.city.cityId}</span>
                    <button onClick={() => this.removeSelf(this.props.city)}
                            className="bg-slate-900 text-white hover:bg-red-900">DELETE
                    </button>
                    <button onClick={() => this.editSelf(this.props.city)}
                            className="bg-slate-900 text-white hover:bg-sky-900">EDIT
                    </button>
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
