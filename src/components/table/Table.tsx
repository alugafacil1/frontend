import {
    getCoreRowModel,
    useReactTable,
    ColumnDef,
    PaginationState,
    flexRender,
} from '@tanstack/react-table';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import * as S from './styles';

interface SimpleTableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[];
    totalItems?: number;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
}
// ... (mantenha os imports)

export function Table<T>({
    data,
    columns,
    totalItems = 0,
    pagination,
    setPagination,
}: SimpleTableProps<T>) {
    
    const table = useReactTable({
        data,
        columns,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(totalItems / pagination.pageSize),
    });

    return (
        <S.Container>
            <S.TableWrapper>
                <S.TableComp>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <S.TH key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </S.TH>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <S.TR key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <S.TD key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </S.TD>
                                    ))}
                                </S.TR>
                            ))
                        ) : (
                            <S.TR>
                                <S.TD colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                                    Nenhum registro encontrado.
                                </S.TD>
                            </S.TR>
                        )}
                    </tbody>
                </S.TableComp>
            </S.TableWrapper>

            <S.PaginationContainer>
                <div>
                    Mostrando <strong>{table.getRowModel().rows.length}</strong> de <strong>{totalItems}</strong> resultados
                </div>
                
                <S.PaginationButtonsContainer>
                    <span style={{ marginRight: '1rem', alignSelf: 'center' }}>
                        Página {pagination.pageIndex + 1} de {table.getPageCount() || 1}
                    </span>
                    <S.PaginationButton 
                        onClick={() => table.previousPage()} 
                        disabled={!table.getCanPreviousPage()}
                    >
                        <MdKeyboardArrowLeft size={20} />
                    </S.PaginationButton>
                    <S.PaginationButton 
                        onClick={() => table.nextPage()} 
                        disabled={!table.getCanNextPage()}
                    >
                        <MdKeyboardArrowRight size={20} />
                    </S.PaginationButton>
                </S.PaginationButtonsContainer>
            </S.PaginationContainer>
        </S.Container>
    );
}