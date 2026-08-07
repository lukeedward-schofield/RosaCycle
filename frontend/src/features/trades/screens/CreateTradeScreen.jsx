import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "@/shared/components/layout/Header";
import PrimaryButton from "@/shared/components/common/PrimaryButton";
import { assessTradePhoto } from "@/shared/services/api";
import { createTrade } from "@/shared/services/api";

export default function CreateTradeScreen() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [assessing, setAssessing] = useState(true);

    const image = state?.image;
    const aiData = state?.aiData;

    const [form, setForm] = useState({
        itemName: "",
        category: "",
        material: "",
        description: "",
        weightKg: "",
        quantity: "",
    });

    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!image) return;

        const url = URL.createObjectURL(image);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [image]);

    useEffect(() => {
        if (!image) return;

        const runAssessment = async () => {
            setAssessing(true);

            try {
                const result = await assessTradePhoto(image);

                setForm({
                    itemName: result.itemName ?? "",
                    category: result.category ?? "",
                    material: result.material ?? "",
                    description: result.description ?? "",
                    weightKg: result.weightKg ?? "",
                    quantity: result.quantity ?? "",
                });
            } catch (err) {
                console.error(err);
            }
        };

        runAssessment();
    }, [image]);

    const handleCreateTrade = async () => {
        if (!image) return;

        try {
            const trade = await createTrade(
                {
                    itemName: form.itemName,
                    category: form.category,
                    material: form.material,
                    description: form.description,
                    weightKg: form.weightKg,
                    quantity: form.quantity,
                    // temporary values
                    locationText: "Unknown",
                    tradingForType: "negotiating",
                },
                image
            );

            navigate("/trades/scan/created", {
                state: {
                    trade,
                },
            });
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to create trade.");
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header title="Create Trade" />


            <div className="p-4">

                {assessing ? (

                    <div className="py-20 text-center">
                        <p className="text-lg font-semibold">
                            Analyzing your item...
                        </p>

                        <p className="text-gray-500 mt-2">
                            AI is estimating the material, category and weight.
                        </p>
                    </div>

                ) : (

                    <>

                        {image && (
                            <img
                                src={previewUrl}
                                alt="Trade"
                                className="w-full h-64 object-cover rounded-xl mb-6"
                            />
                        )}

                        <div className="space-y-4">

                            <input
                                className="w-full border rounded-xl p-3"
                                placeholder="Item name"
                                value={form.itemName}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        itemName: e.target.value,
                                    })
                                }
                            />

                            <label className="block text-sm font-medium mb-1">
                                Category
                            </label>
                            <input
                                className="w-full border rounded-xl p-3"
                                placeholder="Category"
                                value={form.category}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category: e.target.value,
                                    })
                                }
                            />

                            <label className="block text-sm font-medium mb-1">
                                Material
                            </label>
                            <input
                                className="w-full border rounded-xl p-3"
                                placeholder="Material"
                                value={form.material}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        material: e.target.value,
                                    })
                                }
                            />

                            <label className="block text-sm font-medium mb-1">
                                Description
                            </label>
                            <textarea
                                className="w-full border rounded-xl p-3"
                                rows={4}
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                            />

                            <label className="block text-sm font-medium mb-1">
                                Weight
                            </label>
                            <input
                                type="number"
                                className="w-full border rounded-xl p-3"
                                placeholder="Weight"
                                value={form.weightKg}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        weightKg: e.target.value,
                                    })
                                }
                            />

                            <label className="block text-sm font-medium mb-1">
                                    Quantity
                            </label>
                            <input
                                type="number"
                                className="w-full border rounded-xl p-3"
                                placeholder="Quantity"
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        quantity: e.target.value,
                                    })
                                }
                            />

                        </div>

                        <div className="mt-6">
                            <PrimaryButton onClick={handleCreateTrade}>
                                Create Trade
                            </PrimaryButton>
                        </div>

                    </>

                )}

            </div>
        </div>
    );
}