import { mount } from '@vue/test-utils'
import Privacy from '@/components/Privacy.vue'

describe('Privacy.vue', () => {
    it('Checkbox is present', () => {
        const wrapper = mount(Privacy, {
            props: {
                readOnly: true
            }
        });
        expect(wrapper.html().includes("checkbox")).toBe(false);
    });

    it('Checkbox is not present', () => {
        const wrapper = mount(Privacy, {
            props: {
                readOnly: false
            }
        });
        expect(wrapper.html().includes("checkbox")).toBe(true);
    });
})
