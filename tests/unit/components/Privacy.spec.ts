import Privacy from "@/components/Privacy.vue";
import { shallowMount } from "@vue/test-utils";

describe("Privacy.vue", () => {
    it("Checkbox is present", () => {
        const wrapper = shallowMount(Privacy, {
            props: {
                readOnly: true,
            },
        });
        expect(wrapper.html().includes("checkbox")).toBe(false);
    });

    it("Checkbox is not present", () => {
        const wrapper = shallowMount(Privacy, {
            props: {
                readOnly: false,
            },
        });
        expect(wrapper.html().includes("checkbox")).toBe(true);
    });
});
