import editForm from "../form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import {
  delRouteApi,
  getRouteTreeApi,
  type RouteModel,
  saveOrUpdateRouteApi
} from "@/api/system/route";
import { transformI18n } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import { DictTag } from "@/components/ReDict";
import { SYS_MENU_TYPE } from "@/components/ReDict/DictKey";
import { useDictStoreHook } from "@/store/modules/dict";

export function useMenu() {
  const form = reactive({
    title: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const dictStore = useDictStoreHook();

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "title",
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{transformI18n(row.title)}</span>
        </>
      )
    },
    {
      label: "菜单类型",
      prop: "routeType",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <DictTag
          dict-key={SYS_MENU_TYPE}
          value={row.routeType}
          size={props.size}
          use-list-class={true}
        />
      )
    },
    {
      label: "路由路径",
      prop: "path"
    },
    {
      label: "组件路径",
      prop: "component",
      formatter: ({ path, component }) =>
        isAllEmpty(component) ? path : component
    },
    {
      label: "权限标识",
      prop: "auths"
    },
    {
      label: "排序",
      prop: "rank",
      width: 100
    },
    {
      label: "隐藏",
      prop: "showLink",
      formatter: ({ showLink }) => (showLink ? "否" : "是"),
      width: 100
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  // 递归搜索树结构
  function filterTreeByTitle(tree: any[], searchTitle: string): any[] {
    if (!tree || !Array.isArray(tree)) return [];
    const filtered: any[] = [];
    for (const node of tree) {
      const nodeTitle = transformI18n(node.title);
      const matches = nodeTitle.includes(searchTitle);
      const filteredChildren = node.children
        ? filterTreeByTitle(node.children, searchTitle)
        : [];

      // 如果当前节点匹配或有子节点匹配，则保留该节点
      if (matches || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children:
            filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
    }
    return filtered;
  }

  // 检查数据是否已经是树结构（包含children字段）
  function isTreeStructure(data: any[]): boolean {
    if (!data || !Array.isArray(data) || data.length === 0) return false;
    // 检查是否有任何节点包含children字段
    return data.some(item => item.children && Array.isArray(item.children));
  }

  async function onSearch() {
    loading.value = true;
    const { result } = await getRouteTreeApi();
    let newData = result;

    if (!isAllEmpty(form.title)) {
      // 前端搜索菜单名称
      if (isTreeStructure(newData)) {
        // 如果已经是树结构，递归搜索
        newData = filterTreeByTitle(newData, form.title);
      } else {
        // 如果是一维数组，直接过滤
        newData = newData.filter(item =>
          transformI18n(item.title).includes(form.title)
        );
      }
    }

    // 如果已经是树结构，直接使用；否则使用handleTree转换
    if (isTreeStructure(newData)) {
      dataList.value = newData;
    } else {
      dataList.value = handleTree(newData); // 处理成树结构
    }
    loading.value = false;
  }

  function formatHigherMenuOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].title = transformI18n(treeList[i].title);
      formatHigherMenuOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: RouteModel) {
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          routeType: row?.routeType ?? 0,
          higherMenuOptions: formatHigherMenuOptions(cloneDeep(dataList.value)),
          parentId: row?.parentId,
          title: row?.title ?? "",
          name: row?.name,
          path: row?.path,
          component: row?.component,
          rank: row?.rank,
          redirect: row?.redirect,
          icon: row?.icon,
          extraIcon: row?.extraIcon,
          enterTransition: row?.enterTransition,
          leaveTransition: row?.leaveTransition,
          transitionName: row?.transitionName,
          activePath: row?.activePath,
          auths: row?.auths,
          roles: row?.roles,
          frameSrc: row?.frameSrc,
          frameLoading: row?.frameLoading ?? true,
          keepAlive: row?.keepAlive ?? false,
          hiddenTag: row?.hiddenTag ?? false,
          dynamicLevel: row?.dynamicLevel,
          showLink: row?.showLink ?? true,
          showParent: row?.showParent ?? false,
          remark: row?.remark,
          id: row?.id
        }
      },
      width: "45%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as RouteModel;
        FormRef.validate(async valid => {
          if (valid) {
            const result = await saveOrUpdateRouteApi(curData);
            if (result.code === 200) {
              message(
                `您${title}了菜单名称为${transformI18n(curData.title)}的这条数据`,
                {
                  type: "success"
                }
              );
              done(); // 关闭弹框
              onSearch(); // 刷新表格数据
            } else {
              message(result.msg, { type: "error" });
            }
          }
        });
      }
    });
  }

  async function handleDelete(row) {
    const result = await delRouteApi(row.id);
    if (result.code === 200) {
      message(`您删除了菜单名称为${transformI18n(row.title)}的这条数据`, {
        type: "success"
      });
      onSearch();
    }
  }

  onMounted(async () => {
    // 预加载菜单类型字典数据，确保列表中的 DictTag 能正确显示
    await dictStore.fetchDictData(SYS_MENU_TYPE);
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改菜单 */
    openDialog,
    /** 删除菜单 */
    handleDelete,
    handleSelectionChange
  };
}
