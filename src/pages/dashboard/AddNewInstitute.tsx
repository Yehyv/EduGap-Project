import DashboardPageTitle from "@/features/Dashboard/components/DashboardPageTitle";
import { TextField } from "@/shared/components";
import FileUploadField from "@/shared/components/forms/FileUploadField";
import DropdownMenu from "@/shared/components/ui/DropdownMenu";
import { phoneKeys } from "@/shared/utils/globals";
import { Formik, Form } from "formik";

const AddNewInstitute = () => {
  return (
    <>
      <DashboardPageTitle text="Add New Institute" />

      <Formik
        initialValues={{
          logo: "",
          image_profile: "",
          email: "",
          phone_key: "",
          phone: "",
          location: "",
          translations: [
            {
              name: "",
              address: "",
              languageId: 1, // Arabic
            },
            {
              name: "",
              address: "",
              languageId: 2, // English
            },
          ],
        }}
        onSubmit={(values) => {
          console.log("SUBMIT DATA:", values);
        }}
      >
        {({ values, handleChange }) => (
          <Form className="bg-white rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                label="Name of Institute in english:"
                name="translations[1].name"
                type="text"
                placeholder="Name of Institute in english"
              />
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                label="Name of Institute in arabic:"
                name="translations[0].name"
                type="text"
                placeholder="Name of Institute in arabic"
              />
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                label="Address of Institute in english:"
                name="translations[1].address"
                type="text"
                placeholder="Address of Institute in english"
              />
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                label="Address of Institute in arabic:"
                name="translations[0].address"
                type="text"
                placeholder="Address of Institute in arabic"
              />
              <TextField
                label="Email:"
                name="email"
                type="email"
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                placeholder="Email:"
              />
              <div className="flex gap-3">
                <div className="w-[120px]">
                  <DropdownMenu
                    label="Phone Key"
                    name="phoneKey"
                    options={phoneKeys}
                  />
                </div>
                <div className="w-full">
                  <TextField
                    moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                    label="Phone:"
                    name="phone"
                    type="text"
                    placeholder="phone number"
                  />
                </div>
              </div>

              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                label="Contact Person:"
                name="contact_person_name"
                type="text"
                placeholder="Contact Person"
              />
              <TextField
                moreStyle="!border-[#ACACAC] focus:!border-secondary !rounded-xl"
                label="Contact Person Position:"
                name="contact_person_position"
                type="text"
                placeholder="Contact Person Position"
              />

              <FileUploadField
                placeholder={"Photo"}
                label="Logo:"
                name="logo"
              />

              <FileUploadField
                placeholder={"Photo"}
                label="Profile Image:"
                name="image_profile"
                moreStyle="!bg-[#E3E3E3] !text-black hover:!bg-gray-300 "
              />
            </div>

            <div className="text-end mt-10">
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-dark cursor-pointer text-white px-12 py-1.5 rounded-xl me-auto"
              >
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default AddNewInstitute;
